document.querySelectorAll("input:not([type=color])").forEach(inputElement => inputElement.addEventListener("change", saveOptions));
document.querySelectorAll("input[type=color]").forEach(inputElement => {
    inputElement.addEventListener("change", saveOptions);
});

document.addEventListener("DOMContentLoaded", restoreOptions);

function geti(elementId) {
    return document.getElementById(elementId);
}

function saveOptions() {
    var startColor;
    if (geti("random-on-start").checked) {
        startColor = "random";
    } else if (geti("custom-on-start").checked) {
        startColor = geti("start-color-custom").value;
    }

    var startBgColor;
    if (geti("random-bg-on-start").checked) {
        startBgColor = "random";
    } else if (geti("match-bg-on-start").checked) {
        startBgColor = "match";
    } else if (geti("custom-bg-on-start").checked) {
        startBgColor = geti("start-bg-custom").value;
    }

    var startBgColorIncognito;
    if (geti("random-bg-on-incognito").checked) {
        startBgColorIncognito = "random";
    } else if (geti("match-bg-on-incognito").checked) {
        startBgColorIncognito = "match";
    } else if (geti("dark-bg-on-incognito").checked) {
        startBgColorIncognito = "#222222";
    } else if (geti("custom-bg-on-incognito").checked) {
        startBgColorIncognito = geti("incognito-bg-custom").value;
    }

    chrome.storage.sync.set({
        "clickBGChange": geti("click-bg-change").checked,
        "sampleHexVisible": geti("sample-hex-visible").checked,
        "sampleNameVisible": geti("sample-name-visible").checked,
        "schemeVisible": geti("scheme-visible").checked,
        "schemeHexVisible": geti("scheme-hex-visible").checked,
        "schemeClickSampleChange": geti("scheme-click-sample-change").checked,
        "schemeClickBGChange": geti("scheme-click-bg-change").checked,
        "randomVisible": geti("random-visible").checked,
        "settingsVisible": geti("settings-visible").checked,
        "fontfamily": geti("font-family").value,
        "fontsize": geti("font-size").value,
        "uppercaseHex": geti("uppercase-hex").checked,
        "startColor": startColor,
        "startBgColor": startBgColor,
        "startBgColorIncognito": startBgColorIncognito
    }, function () {
        geti("saved-banner").className = "slide-in";
        setTimeout(function () {
            geti("saved-banner").className = "slide-out";
        }, 800);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        "clickBGChange": true,
        "sampleHexVisible": true,
        "sampleNameVisible": false,
        "schemeVisible": true,
        "schemeHexVisible": true,
        "schemeClickSampleChange": false,
        "schemeClickBGChange": false,
        "randomVisible": true,
        "settingsVisible": true,
        "fontfamily": "Open Sans",
        "fontsize": 100,
        "uppercaseHex": true,
        "startColor": "random",
        "startBgColor": "random",
        "startBgColorIncognito": "#222222"
    }, function (items) {
        geti("click-bg-change").checked = items.clickBGChange;
        geti("sample-hex-visible").checked = items.sampleHexVisible;
        geti("sample-name-visible").checked = items.sampleNameVisible;
        geti("scheme-visible").checked = items.schemeVisible;
        geti("scheme-hex-visible").checked = items.schemeHexVisible;
        geti("scheme-click-sample-change").checked = items.schemeClickSampleChange;
        geti("scheme-click-bg-change").checked = items.schemeClickBGChange;
        geti("random-visible").checked = items.randomVisible;
        geti("settings-visible").checked = items.settingsVisible;
        geti("font-family").value = items.fontfamily;
        geti("font-size").value = items.fontsize;
        geti("uppercase-hex").checked = items.uppercaseHex;

        if (items.startColor === "random") {
            geti("random-on-start").checked = true;
        } else {
            geti("custom-on-start").checked = true;
            geti("start-color-custom").value = items.startColor;
        }

        if (items.startBgColor === "random") {
            geti("random-bg-on-start").checked = true;
        } else if (items.startBgColor === "match") {
            geti("match-bg-on-start").checked = true;
        } else {
            geti("custom-bg-on-start").checked = true;
            geti("start-bg-custom").value = items.startBgColor;
        }

        if (items.startBgColorIncognito === "random") {
            geti("random-bg-on-incognito").checked = true;
        } else if (items.startBgColorIncognito === "match") {
            geti("match-bg-on-incognito").checked = true;
        } else if (items.startBgColorIncognito === "#222222") {
            geti("dark-bg-on-incognito").checked = true;
        } else {
            geti("custom-bg-on-incognito").checked = true;
            geti("incognito-bg-custom").value = items.startBgColorIncognito;
        }
    });
}
