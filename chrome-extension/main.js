chrome.runtime.onMessage.addListener(function(msg, sender) {
    switch (msg.action) {
        case 'refresh':
            initPage();
            break;
    }
});

initPage();

window.addEventListener('focus', initPage);

function initPage() {
    // Easiest way of sharing hostname with popup.js
    chrome.storage.local.set({hostname: document.location.hostname});
    chrome.storage.sync.get('config', function(data) {
        config = data['config'];
        removeElements();
        runScript();
    });
}

function runScript() {
    var environment = getEnvironment();
    document.removeEventListener('click', checkDomainChange);
    if (environment === '') {
        return;
    }
    if (config.domainChangeWarning === true) {
        document.addEventListener('click', checkDomainChange);
    }
    buildSiteColorElements(config.colorSettings[environment]);
}

function checkDomainChange(event) {
    var target = event.target;
    if (typeof target.hostname === 'undefined') {
        return true;
    }
    if (target.hostname === '') {
        return true;
    }
    if (target.hostname !== document.location.hostname) {
        if (confirm('You are leaving the site, are you sure?') !== true) {
            event.preventDefault();
        }
    }
}

function getEnvironment() {
    var hostname = document.location.hostname;
    if (config.sites.none.indexOf(hostname) !== -1) {
        return '';
    }

    for (var index in config.colorOrder) {
        var environment = config.colorOrder[index];
        if (config.sites[environment].indexOf(hostname) !== -1) {
            return environment;
        }

        var settings = config.colorSettings[environment];
        for (var index3 in settings.siteMatches) {
            var siteMatch = settings.siteMatches[index3];
            if (hostname.match(siteMatchRegExp(siteMatch)) !== null) {
                return environment
            }
        }
    }
    return '';
}

function buildSiteColorElements(settings) {
    if (config.showColorBar) {
        for (var position in config.colorBarPositions) {
            if (config.colorBarPositions[position] === false) {
                continue;
            }
            buildColorBar(settings, position);
        }
    }
    if (config.showMessage) {
        buildMessage(settings);
    }
}

function buildColorBar(settings, position) {
    var element = document.createElement('div');
    element.id = 'site-color-coding-color-bar-' + position;
    element.style.position = 'fixed';
    element.style.zIndex = 999999;
    element.style.backgroundColor = settings.color;
    switch (position) {
        case 'top':
        case 'bottom':
            element.style.width = '100%';
            element.style.height = '3px';
            element.style.left = 0;
            break;

        case 'left':
        case 'right':
            element.style.height = '100%';
            element.style.width = '3px';
            element.style.top = 0;
            break;
    }
    switch (position) {
        case 'top':
            element.style.top = 0;
            break;

        case 'bottom':
            element.style.bottom = 0;
            break;

        case 'left':
            element.style.left = 0;
            break;

        case 'right':
            element.style.right = 0;
            break;
    }
    document.body.appendChild(element);
}

function buildMessage(settings) {
    var container = document.createElement('div');
    container.id = 'site-color-coding-message';
    container.style.position = 'fixed';
    container.style.width = 0;
    container.style.height = 0;
    container.style.zIndex = 999999;

    var element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.padding = '5px 20px';
    element.style.minWidth = '150px';
    element.style.backgroundColor = '#FFFFFF';
    element.style.borderColor = settings.color;
    element.style.borderWidth = '2px';
    element.style.borderStyle = 'solid';
    element.style.textAlign = 'center';
    element.style.fontSize = '13px';
    element.style.fontFamily = 'Verdana';
    element.style.fontWeight = 'bold';
    element.style.letterSpacing = '2px';
    element.style.whiteSpace = 'nowrap';

    if (config.messagePosition.bottom === true) {
        container.style.bottom = 0;
        element.style.bottom = 0;
    }

    if (config.messagePosition.top === true) {
        container.style.top = 0;
        element.style.top = 0;
    }

    if (config.messagePosition.top === false && config.messagePosition.bottom === false) {
    }

    if (config.messagePosition.left === true) {
        container.style.left = 0;
        element.style.left = 0;
    }

    if (config.messagePosition.right === true) {
        container.style.right = 0;
        element.style.right = 0;
    }

    if (config.messagePosition.left === false && config.messagePosition.right === false) {
    }

    element.innerText = settings.message;
    container.appendChild(element);
    document.body.appendChild(container);

    if (config.messagePosition.rotated === true) {
        if (config.messagePosition.left === true) {
            element.style.transformOrigin = 'bottom left';
            element.style.transform = 'rotate(90deg)';
        }
        if (config.messagePosition.right === true) {
            element.style.transformOrigin = 'bottom right';
            element.style.transform = 'rotate(-90deg)';
        }
        if (config.messagePosition.top === true) {
            element.style.top = '-' + element.offsetHeight + 'px';
        }
        if (config.messagePosition.bottom === true) {
            element.style.bottom = element.offsetWidth + 'px';
        }
    }

    if (config.messagePosition.top === false && config.messagePosition.bottom === false) {
        container.style.top = '50%';
        element.style.marginTop = '-50%';
        if (config.messagePosition.rotated === true) {
            element.style.top = '-' + (Math.floor(element.offsetWidth / 2) + element.offsetHeight) + 'px';
        }
        else {
            element.style.top = '-' + Math.floor(element.offsetHeight / 2) + 'px';
        }
    }

    if (config.messagePosition.left === false && config.messagePosition.right === false) {
        container.style.left = '50%';
        element.style.marginLeft = '-50%';
        element.style.left = '-' + Math.floor(element.offsetWidth / 2) + 'px';
    }

    element.addEventListener('mouseenter', function () {
        element.style.opacity = 0.1;
    });
    element.addEventListener('mouseleave', function () {
        element.style.opacity = 1;
    });
}

function removeElements() {
    for (var position in config.colorBarPositions) {
        var colorBar = document.getElementById('site-color-coding-color-bar-' + position);
        if (colorBar !== null) {
            colorBar.remove();
        }
    }
    var message = document.getElementById('site-color-coding-message');
    if (message !== null) {
        message.remove();
    }
}