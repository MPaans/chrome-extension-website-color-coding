chrome.storage.sync.get('config', function(data) {
    config = data.config;

    eventKeyup = document.createEvent('HTMLEvents');
    eventKeyup.initEvent('keyup', false, true);
    eventSubmit = document.createEvent('HTMLEvents');
    eventSubmit.initEvent('submit', false, true);

    rawConfigUpdate();
    initInputs();
});

function initInputs() {
    document.getElementById('close-options').addEventListener('click', function (event) {
        window.close();
    });

    document.getElementById('settings-form').addEventListener('submit', function (event) {
        event.preventDefault();
    });

    document.getElementById('color-bar').checked = config.showColorBar;
    document.getElementById('message').checked = config.showMessage;
    document.getElementById('domain-change-warning').checked = config.domainChangeWarning;

    document.getElementById('color-bar-top').checked = config.colorBarPositions.top;
    document.getElementById('color-bar-bottom').checked = config.colorBarPositions.bottom;
    document.getElementById('color-bar-left').checked = config.colorBarPositions.left;
    document.getElementById('color-bar-right').checked = config.colorBarPositions.right;

    document.getElementById('message-top').checked = config.messagePosition.top;
    document.getElementById('message-bottom').checked = config.messagePosition.bottom;
    document.getElementById('message-left').checked = config.messagePosition.left;
    document.getElementById('message-right').checked = config.messagePosition.right;
    document.getElementById('message-rotated').checked = config.messagePosition.rotated;

    document.getElementById('add-color-setting').addEventListener('click', createColorSetting);
    document.getElementById('new-color-setting').addEventListener('keyup', createColorSettingKeyupWrapper);

    var colorSettings = document.getElementById('color-settings');
    for (index in config.colorOrder) {
        var key = config.colorOrder[index];

        var trColorSettings = document.createElement('tr');
        trColorSettings.id = 'color-setting-' + key;

        // var tdIndex = document.createElement('td');
        // tdIndex.className = 'col-index':
        // tdIndex.innerText = index;
        // trColorSettings.appendChild(tdIndex);

        var tdKey = document.createElement('td');
        tdKey.className = 'col-name';
        tdKey.innerText = key;
        trColorSettings.appendChild(tdKey);

        var inputColor = document.createElement('input');
        inputColor.id = 'color-setting-' + key + '-color';
        inputColor.value = config.colorSettings[key].color;
        inputColor.addEventListener('keyup', updateColor);
        inputColor.addEventListener('change', updateColor);
        var tdColor = document.createElement('td');
        tdColor.className = 'col-color';
        tdColor.appendChild(inputColor);
        trColorSettings.appendChild(tdColor);

        var inputMessage = document.createElement('input');
        inputMessage.id = 'color-setting-' + key + '-message';
        inputMessage.value = config.colorSettings[key].message;
        var tdMessage = document.createElement('td');
        tdMessage.className = 'col-message';
        tdMessage.appendChild(inputMessage);
        trColorSettings.appendChild(tdMessage);

        var inputSites = document.createElement('input');
        inputSites.value = config.colorSettings[key].siteMatches;
        var tdSites = document.createElement('td');
        tdSites.className = 'col-sitematches';
        tdSites.appendChild(inputSites);
        trColorSettings.appendChild(tdSites);

        var buttonDelete = document.createElement('button');
        buttonDelete.innerText = 'Delete';
        buttonDelete.addEventListener('click', deleteColorSetting);
        var tdDelete = document.createElement('td');
        tdDelete.className = 'col-delete';
        tdDelete.appendChild(buttonDelete);
        trColorSettings.appendChild(tdDelete);

        var tdMove = document.createElement('td');
        tdMove.className = 'col-move';
        if (index != 0) {
            var buttonMove = document.createElement('button');
            buttonMove.innerText = 'Move up';
            buttonMove.addEventListener('click', colorOrderMoveUp);
            tdMove.appendChild(buttonMove);
        }
        trColorSettings.appendChild(tdMove);

        colorSettings.appendChild(trColorSettings);

        inputColor.dispatchEvent(eventKeyup);
    }

    var sitesUnordered = {};
    for (var environment in config.sites) {
        for (var siteConfig in config.sites[environment]) {
            sitesUnordered[config.sites[environment][siteConfig]] = environment;
        }
    }

    if (Object.keys(sitesUnordered).length === 0) {
        document.getElementById('fieldset-sites').remove();
    }
    else {
        var sitesOrdered = {};
        Object.keys(sitesUnordered).sort().forEach(function(key) {
            sitesOrdered[key] = sitesUnordered[key];
        });

        var sites = document.getElementById('sites');
        for (var site in sitesOrdered) {
            var trSite = document.createElement('tr');

            var tdSite = document.createElement('td');
            tdSite.className = 'col-site';
            tdSite.innerText = site;
            trSite.appendChild(tdSite);

            var tdSiteEnvironment = document.createElement('td');
            tdSiteEnvironment.className = 'col-environment';
            tdSiteEnvironment.innerText = sitesOrdered[site];
            trSite.appendChild(tdSiteEnvironment);

            var tdSiteDelete = document.createElement('td');
            var buttonSiteDelete = document.createElement('button');
            buttonSiteDelete.innerText = 'Delete';
            buttonSiteDelete.addEventListener('click', deleteSite);
            tdSiteDelete.className = 'col-delete';
            tdSiteDelete.appendChild(buttonSiteDelete);
            trSite.appendChild(tdSiteDelete);

            sites.appendChild(trSite);
        }
    }

    document.getElementById('reset-config').addEventListener('click', configReset);
    document.getElementById('show-raw-config').addEventListener('click', rawConfigShow);
    document.getElementById('hide-raw-config').addEventListener('click', rawConfigHide);

    var inputs = document.getElementsByTagName('input');
    for (index = 0; index < inputs.length; index++) {
        var input = inputs[index];
        input.autocomplete = 'off';
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });
        if (input.id === 'color-setting-new') {
            return null;
        }
        input.addEventListener('change', configSave);
        input.addEventListener('keyup', configSave);
    }
}

function createColorSettingKeyupWrapper(event) {
    if (event.key !== 'Enter') {
        return;
    }
    createColorSetting();
}

function createColorSetting() {
    var key = document.getElementById('new-color-setting').value;
    if (key.trim() === '') {
        return false;
    }
    if (config.colorOrder.indexOf(key) !== -1) {
        alert(key + ' already exists');
        return false;
    }
    config.colorSettings[key] = {
        color: randomColor(),
        message: key.charAt(0).toUpperCase() + key .slice(1) + ' environment',
        siteMatches: []
    };
    config.colorOrder.push(key);
    config.sites[key] = [];
    chrome.storage.sync.set({config: config});
    window.location.reload();
}

function deleteColorSetting(event) {
    var button = event.srcElement;
    var key = getColorSettingKey(button);
    var index = config.colorOrder.indexOf(key);

    delete config.colorSettings[key];
    delete config.sites[key];
    config.colorOrder.splice(index, 1);
    chrome.storage.sync.set({config: config});
    window.location.reload();
}

function deleteSite() {
    var environment = this.parentElement.parentElement.getElementsByClassName('col-environment').item(0).innerText;
    var site = this.parentElement.parentElement.getElementsByClassName('col-site').item(0).innerText;
    var index = config.sites[environment].indexOf(site);
    config.sites[environment].splice(index, 1);
    chrome.storage.sync.set({config: config});
    window.location.reload();
}

function colorOrderMoveUp() {
    var button = event.srcElement;
    var key = getColorSettingKey(button);
    var index = config.colorOrder.indexOf(key);

    config.colorOrder.splice(index, 1);
    config.colorOrder.splice(index - 1, 0, key);
    chrome.storage.sync.set({config: config});
    window.location.reload();
}

function updateColor(event) {
    var inputColor = event.srcElement;
    var key = getColorSettingKey(inputColor);
    var inputMessage = document.getElementById('color-setting-' + key + '-message');
    inputMessage.style.backgroundColor = inputColor.value;
}

function getColorSettingKey(element) {
    return element.parentElement.parentElement.id.replace(/^.*-/, '');
}

function configReset() {
    if (confirm('Are you sure?')) {
        config = shared();
        chrome.storage.sync.set({config: config});
        window.location.reload();
    }
}

function rawConfigUpdate () {
    document.getElementById('raw-config').innerText =
        JSON.stringify(config, null, 2);
}

function rawConfigHide() {
    document.getElementById('show-raw-config').style.display = 'inline-block';
    document.getElementById('hide-raw-config').style.display = 'none';
    document.getElementById('raw-config').style.display = 'none';
}

function rawConfigShow() {
    document.getElementById('show-raw-config').style.display = 'none';
    document.getElementById('hide-raw-config').style.display = 'inline-block';
    document.getElementById('raw-config').style.display = 'block';
}

function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function configSanity(element) {
    switch (element.id) {
        case 'message-top':
            if (document.getElementById('message-top').checked) {
                document.getElementById('message-bottom').checked = false;
            }
            break;

        case 'message-bottom':
            if (document.getElementById('message-bottom').checked) {
                document.getElementById('message-top').checked = false;
            }
            break;

        case 'message-left':
            if (document.getElementById('message-left').checked) {
                document.getElementById('message-right').checked = false;
            }
            break;

        case 'message-right':
            if (document.getElementById('message-right').checked) {
                document.getElementById('message-left').checked = false;
            }
            break;
    }
}

function configSave(event) {
    var element = event.srcElement;
    configSanity(element);

    config.showColorBar = document.getElementById('color-bar').checked;
    config.showMessage = document.getElementById('message').checked;
    config.domainChangeWarning = document.getElementById('domain-change-warning').checked;

    config.colorBarPositions.top = document.getElementById('color-bar-top').checked;
    config.colorBarPositions.bottom = document.getElementById('color-bar-bottom').checked;
    config.colorBarPositions.left = document.getElementById('color-bar-left').checked;
    config.colorBarPositions.right = document.getElementById('color-bar-right').checked;

    config.messagePosition.top = document.getElementById('message-top').checked;
    config.messagePosition.bottom = document.getElementById('message-bottom').checked;
    config.messagePosition.left = document.getElementById('message-left').checked;
    config.messagePosition.right = document.getElementById('message-right').checked;
    config.messagePosition.rotated = document.getElementById('message-rotated').checked;

    var colorSettings = document.getElementById('color-settings').children;
    for (var index = 0; index < colorSettings.length; index++) {
        var colorSetting = colorSettings[index];
        var key = colorSetting.id.replace(/^.*-/, '');

        var inputColor = colorSetting.getElementsByClassName('col-color').item(0).getElementsByTagName('input').item(0);
        config.colorSettings[key].color = inputColor.value;

        var inputMessage = colorSetting.getElementsByClassName('col-message').item(0).getElementsByTagName('input').item(0);
        config.colorSettings[key].message = inputMessage.value;

        var inputSiteMatches = colorSetting.getElementsByClassName('col-sitematches').item(0).getElementsByTagName('input').item(0);
        var siteMatchesArray = inputSiteMatches.value.split(',');
        // Remove empty items from array.
        siteMatchesArray = siteMatchesArray.filter(function (e) {return e === 0 || e;});
        config.colorSettings[key].siteMatches = siteMatchesArray;
    }

    chrome.storage.sync.set({config: config});
    rawConfigUpdate();
}