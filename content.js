(async () => {
    const extensionActive = await chrome.storage.local.get('extensionActive');
    console.log(extensionActive.extensionActive);
    if (extensionActive.extensionActive) {
        const baseUrl = new URL(window.location.href);
        const paths = new Set();

        const addPathsFromElements = (selector, attribute) => {
            document.querySelectorAll(selector).forEach(element => {
                let url = element.getAttribute(attribute);
                if (url && !url.startsWith('#') && !url.startsWith('javascript:')) {
                    const fullUrl = new URL(url, baseUrl).href;
                    paths.add(fullUrl);
                }
            });
        };

        addPathsFromElements('a[href]', 'href');
        addPathsFromElements('link[href]', 'href');
        addPathsFromElements('script[src]', 'src');
        addPathsFromElements('img[src]', 'src');

        const validPaths = new Set();
        paths.forEach(path => {
            const urlObj = new URL(path);
            if (urlObj.pathname.endsWith('/') || urlObj.pathname.endsWith('.php')) {
                validPaths.add(urlObj.href);
            } else {
                const pathSegments = urlObj.pathname.split('/');
                pathSegments.pop();
                const directoryPath = `${urlObj.origin}${pathSegments.join('/')}/`;
                validPaths.add(directoryPath);
            }
        });

        const generateParentPaths = (url) => {
            let urlObj = new URL(url);
            let path = urlObj.pathname.split('/').filter(part => part);
            let parentPaths = [];
            for (let i = path.length; i > 0; i--) {
                parentPaths.push(`${urlObj.origin}/${path.slice(0, i).join('/')}/`);
            }
            parentPaths.push(urlObj.origin + '/');
            return parentPaths;
        };

        const allPathsToCheck = new Set();
        validPaths.forEach(path => {
            generateParentPaths(path).forEach(parentPath => allPathsToCheck.add(parentPath));
        });

        const checkUrl = async (url) => {
            try {
                const response = await fetch(url, {
                    mode: 'no-cors'
                });
                let resText = await response.text();
                if (resText.includes('refs/heads') && resText.length < 90) {
                    return url;
                }
            } catch (error) {
                // Ignore fetch errors
            }
            return null;
        };

        const foundPaths = [];
        const fetchPromises = Array.from(allPathsToCheck).map(async (path) => {
            const gitHeadUrl = new URL('.git/HEAD', path).href;

            // If current page is HTTPS, only use HTTPS URLs
            const urlsToCheck = baseUrl.protocol === 'https:' ?
                [gitHeadUrl] :
                [gitHeadUrl, gitHeadUrl.replace('https://', 'http://')];

            for (const url of urlsToCheck) {
                const result = await checkUrl(url);
                if (result) {
                    foundPaths.push(result);
                    break; // Stop checking other URLs if one is successful
                }
            }
        });
        try {
            await Promise.all(fetchPromises);
        } catch (error) {
            console.log(error);
        }

        if (foundPaths.length > 0) {
            chrome.runtime.sendMessage({
                action: "storeResult",
                data: foundPaths
            });
        }
    }
})();
