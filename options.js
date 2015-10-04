var saveButton = document.getElementById("save");
saveButton.onclick = saveOptions;

document.addEventListener('DOMContentLoaded', restoreOptions);

function saveOptions() {
    var startColorRadios = document.getElementsByName("startColor");
    var startColor = "random";
    if(startColorRadios[1].checked) startColor = document.getElementById("startColorCustom").value;

    var startBgColorRadios = document.getElementsByName("startBg");
    var startBgColor = "random";
    if(startBgColorRadios[1].checked) startBgColor = "match";
    if(startBgColorRadios[2].checked) startBgColor = document.getElementById("startBgCustom").value;

    chrome.storage.sync.set({
        "clickBGChange": document.getElementById("clickBGChange").checked,
        "sampleHexVisible": document.getElementById("sampleHexVisible").checked,
        "schemeVisible": document.getElementById("schemeVisible").checked,
        "schemeHexVisible": document.getElementById("schemeHexVisible").checked,
        "randomVisible": document.getElementById("randomVisible").checked,
        "fontfamily": document.getElementById("fontfamily").value,
        "fontsize": document.getElementById("fontsize").value,
        "uppercaseHex": document.getElementById("uppercaseHex").checked,
        "startColor": startColor,
        "startBgColor": startBgColor
    }, function() {
        saveButton.innerHTML = "Saved!";
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        "clickBGChange": true,
        "sampleHexVisible": true,
        "schemeVisible": true,
        "schemeHexVisible": true,
        "randomVisible": true,
        "fontfamily": "Open Sans",
        "fontsize": 12,
        "uppercaseHex": true,
        "startColor": "random",
        "startBgColor": "#FFFFFF"
    }, function(items) {
        document.getElementById("clickBGChange").checked = items.clickBGChange;
        document.getElementById("sampleHexVisible").checked = items.sampleHexVisible;
        document.getElementById("schemeVisible").checked = items.schemeVisible;
        document.getElementById("schemeHexVisible").checked = items.schemeHexVisible;
        document.getElementById("randomVisible").checked = items.randomVisible;
        document.getElementById("fontfamily").value = items.fontfamily;
        document.getElementById("fontsize").value = items.fontsize;
        document.getElementById("uppercaseHex").checked = items.uppercaseHex;

        if(items.startColor === "random") {
            document.getElementsByName("startColor")[0].checked = true;
        } else {
            document.getElementsByName("startColor")[1].checked = true;
            document.getElementById("startColorCustom").value = items.startColor;
        }
        
        document.getElementsByName("startBg")[2].checked = false;
        if(items.startBgColor === "random") {
            document.getElementsByName("startBg")[0].checked = true;
        } else if(items.startBgColor === "match") {
            document.getElementsByName("startBg")[1].checked = true;
        } else {
            document.getElementsByName("startBg")[2].checked = true;
            document.getElementById("startBgCustom").value = items.startBgColor;
        }
    });
}
