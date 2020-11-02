let options = {};

window.onload = () => {
    let hSliderElement = document.getElementById("hue");
    let sSliderElement = document.getElementById("saturation");
    let lSliderElement = document.getElementById("lightness");

    const outputElements = document.getElementsByClassName("output");
    let hNumberElement = outputElements[0];
    let sNumberElement = outputElements[1];
    let lNumberElement = outputElements[2];

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
    }, (items) => {
        options = items;

        if (options.clickBGChange) {
            document.getElementById("color").onclick = setBackgroundColor;
        }

        if (options.sampleHexVisible) {
            document.getElementById("colorhex").style.display = "block";
        } else {
            // delete the element
            document.getElementById("colorhex").outerHTML = "";
        }
        if (options.sampleNameVisible) {
            document.getElementById("named-color").style.display = "block";
        } else {
            // delete the element
            document.getElementById("named-color").outerHTML = "";
        }

        if (options.schemeVisible) {
            document.getElementById("scheme").style.display = "block";
        }

        let scheme = document.getElementsByClassName("color");
        if (options.schemeClickSampleChange && options.schemeClickBGChange) {
            scheme[0].onclick = scheme[1].onclick = scheme[2].onclick = function () {
                let bgColor = util.rgbToHex(this.style.backgroundColor);
                setBackgroundColorTo(bgColor, util.isDark(bgColor));

                let id = this.getAttribute("id");
                let h = 0;
                if (id === "complementary") {
                    h = (+hNumberElement.value + 180) % 360;
                } else if (id === "triadic-1") {
                    h = (+hNumberElement.value + 240) % 360;
                } else if (id === "triadic-2") {
                    h = (+hNumberElement.value + 120) % 360;
                }
                hSliderElement.value = hNumberElement.value = h;
                setH();
                setS();
                setL();
                setColor();
            };
        } else if (options.schemeClickSampleChange) {
            scheme[0].onclick = scheme[1].onclick = scheme[2].onclick = function () {
                let id = this.getAttribute("id");
                let h = 0;
                if (id === "complementary") {
                    h = (+hNumberElement.value + 180) % 360;
                } else if (id === "triadic-1") {
                    h = (+hNumberElement.value + 240) % 360;
                } else if (id === "triadic-2") {
                    h = (+hNumberElement.value + 120) % 360;
                }
                hSliderElement.value = hNumberElement.value = h;
                setH();
                setS();
                setL();
                setColor();
            };
        } else if (options.schemeClickBGChange) {
            scheme[0].onclick = scheme[1].onclick = scheme[2].onclick = function () {
                let bgColor = util.rgbToHex(this.style.backgroundColor);
                setBackgroundColorTo(bgColor, util.isDark(bgColor));
            };
        }

        if (options.randomVisible) {
            document.getElementById("random").style.display = "block";
            document.getElementById("random").onclick = setRandomColor;
        }
        if (options.settingsVisible) {
            document.getElementById("settings").style.display = "block";
        }

        document.body.style.fontSize = Math.floor(options.fontsize) / 100 + "em";
        document.body.style.fontFamily = options.fontfamily;

        if (options.startColor === "random") {
            setRandomColor();
        } else { // if user set startColor to be a hex color
            let rgb = util.hexToRgb(options.startColor.slice(1));
            let hsl = util.rgbToHsl(rgb.r, rgb.g, rgb.b);
            setColorToHsl(Math.round(hsl.h * 10) / 10, Math.round(hsl.s * 10) / 10, Math.round(hsl.l * 10) / 10);
        }
        if (chrome.extension.inIncognitoContext) { // incognito mode
            if (options.startBgColorIncognito === "random") {
                let randomHsl = util.randomHsl();
                let hex = util.hslToHex(randomHsl.h, randomHsl.s, randomHsl.l);
                setBackgroundColorTo("#" + hex, util.isDark(hex));
            } else if (options.startBgColorIncognito === "match") {
                setBackgroundColor();
            } else if (options.startBgColorIncognito === "#222222") {
                setBackgroundColorTo("#222", "dark");
            } else { // if user set startBgColor to be a hex color
                let hex = options.startBgColor.slice(1);
                setBackgroundColorTo(options.startBgColor, util.isDark(hex));
            }
        } else { // normal browser mode
            if (options.startBgColor === "match") {
                setBackgroundColor();
            } else if (options.startBgColor === "random") {
                let randomHsl = util.randomHsl();
                let hex = util.hslToHex(randomHsl.h, randomHsl.s, randomHsl.l);
                setBackgroundColorTo("#" + hex, util.isDark(hex));
            } else { // if user set startBgColor to be a hex color
                let hex = options.startBgColor.slice(1);
                setBackgroundColorTo(options.startBgColor, util.isDark(hex));
            }
        }
    });

    hSliderElement.oninput = (e) => {
        hNumberElement.value = e.target.value;
        setS();
        setL();
        setColor();
    };
    hNumberElement.oninput = (e) => {
        let val = util.clamp(e.target.value, 0, 360);
        hNumberElement.value = hSliderElement.value = val;
        setS();
        setL();
        setColor();
    };

    sSliderElement.oninput = (e) => {
        sNumberElement.value = e.target.value;
        setH();
        setL();
        setColor();
    };
    sNumberElement.oninput = (e) => {
        let val = util.clamp(e.target.value, 0, 100);
        sNumberElement.value = sSliderElement.value = val;
        setH();
        setL();
        setColor();
    };

    lSliderElement.oninput = (e) => {
        lNumberElement.value = e.target.value;
        setH();
        setS();
        setColor();
    };
    lNumberElement.oninput = (e) => {
        let val = util.clamp(e.target.value, 0, 100);
        lNumberElement.value = lSliderElement.value = val;
        setH();
        setS();
        setColor();
    };

    function setColor() {
        let colorSampleElement = document.getElementById("color");
        let hex = util.hslToHex(hNumberElement.value, sNumberElement.value, lNumberElement.value);
        colorSampleElement.style.background = "#" + hex;
        if (options.sampleHexVisible) {
            document.getElementById("colorhex").innerHTML = "#" + hex;
        }
        if (options.sampleNameVisible) {
            let ntcMatch = ntc.name("#" + hex);
            let namedColor = ntcMatch[1];
            document.getElementById("named-color").innerHTML = namedColor;
        }
        colorSampleElement.className = util.isDark(hex);
        if (options.schemeVisible) {
            setScheme();
        }
    }

    function setH() {
        hSliderElement.style.background = "linear-gradient(to right," +
            "hsl(0," + sNumberElement.value + "%," + lNumberElement.value + "%)," +
            "hsl(60," + sNumberElement.value + "%," + lNumberElement.value + "%)," +
            "hsl(120," + sNumberElement.value + "%," + lNumberElement.value + "%)," +
            "hsl(180," + sNumberElement.value + "%," + lNumberElement.value + "%)," +
            "hsl(240," + sNumberElement.value + "%," + lNumberElement.value + "%)," +
            "hsl(300," + sNumberElement.value + "%," + lNumberElement.value + "%)," +
            "hsl(360," + sNumberElement.value + "%," + lNumberElement.value + "%))";
    }
    function setS() {
        sSliderElement.style.background = `linear-gradient(to right, hsl(${hNumberElement.value},0%,${lNumberElement.value}%), hsl(${hNumberElement.value},100%,${lNumberElement.value}%))`;
    }
    function setL() {
        lSliderElement.style.background = `linear-gradient(to right, hsl(${hNumberElement.value},${sNumberElement.value}%,0%), hsl(${hNumberElement.value},${sNumberElement.value}%,50%), hsl(${hNumberElement.value},${sNumberElement.value}%,100%))`;
    }

    function setRandomColor() {
        let randomColor = util.randomHsl();
        setColorToHsl(randomColor.h, randomColor.s, randomColor.l);
    }

    function setColorToHsl(h, s, l) {
        hSliderElement.value = hNumberElement.value = h;
        sSliderElement.value = sNumberElement.value = s;
        lSliderElement.value = lNumberElement.value = l;
        setH();
        setS();
        setL();
        setColor();
    }

    function setBackgroundColor() {
        let hex = util.hslToHex(hNumberElement.value, sNumberElement.value, lNumberElement.value);
        setBackgroundColorTo("#" + hex, util.isDark(hex));
    }

    function setBackgroundColorTo(hex, isdark) {
        document.body.style.backgroundColor = hex;
        document.body.className = isdark;
    }

    function setScheme() {
        let scheme = document.getElementsByClassName("color");
        // [0] = #complementary
        // [1] = #triadic-1
        // [2] = #triadic-2
        let hex = [
            util.hslToHex((+hNumberElement.value + 180) % 360, sNumberElement.value, lNumberElement.value),
            util.hslToHex((+hNumberElement.value + 240) % 360, sNumberElement.value, lNumberElement.value),
            util.hslToHex((+hNumberElement.value + 120) % 360, sNumberElement.value, lNumberElement.value)
        ];

        scheme[0].style.backgroundColor = "#" + hex[0];
        scheme[1].style.backgroundColor = "#" + hex[1];
        scheme[2].style.backgroundColor = "#" + hex[2];
        if (options.schemeHexVisible) {
            scheme[0].innerHTML = "#" + hex[0];
            scheme[1].innerHTML = "#" + hex[1];
            scheme[2].innerHTML = "#" + hex[2];

            scheme[0].className = "color " + util.isDark(hex[0]);
            scheme[1].className = "color " + util.isDark(hex[1]);
            scheme[2].className = "color " + util.isDark(hex[2]);
        }
    }
};
