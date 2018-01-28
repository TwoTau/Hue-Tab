var options = {};
window.onload = function() {
    var hSliderElement = document.getElementById("hue");
    var sSliderElement = document.getElementById("saturation");
    var lSliderElement = document.getElementById("lightness");

    var hNumberElement = document.getElementsByClassName("output")[0];
    var sNumberElement = document.getElementsByClassName("output")[1];
    var lNumberElement = document.getElementsByClassName("output")[2];

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
    }, function(items) {
        options = items;

        if(options.clickBGChange) {
            document.getElementById("color").onclick = setBackgroundColor;
        }

        if(options.sampleHexVisible) {
            document.getElementById("colorhex").style.display = "block";
        } else {
            // delete the element
            document.getElementById("colorhex").outerHTML = "";
        }
        if(options.sampleNameVisible) {
            document.getElementById("named-color").style.display = "block";
        } else {
            // delete the element
            document.getElementById("named-color").outerHTML = "";
        }

        if(options.schemeVisible) {
            document.getElementById("scheme").style.display = "block";
        }

        var scheme = document.getElementsByClassName("color");
        if(options.schemeClickSampleChange && options.schemeClickBGChange) {
            scheme[0].onclick = scheme[1].onclick = scheme[2].onclick = function() {
                var bgColor = rgbToHex(this.style.backgroundColor);
                setBackgroundColorTo(bgColor, isDark(bgColor.substring(1)));

                var id = this.getAttribute("id");
                var h = 0;
                if(id === "complementary") {
                    h = (+hNumberElement.value + 180) % 360;
                } else if(id === "triadic-1") {
                    h = (+hNumberElement.value + 240) % 360;
                } else if(id === "triadic-2") {
                    h = (+hNumberElement.value + 120) % 360;
                }
                hSliderElement.value = hNumberElement.value = h;
                setH();
                setS();
                setL();
                setColor();
            };
        } else if(options.schemeClickSampleChange) {
            scheme[0].onclick = scheme[1].onclick = scheme[2].onclick = function() {
                var id = this.getAttribute("id");
                var h = 0;
                if(id === "complementary") {
                    h = (+hNumberElement.value + 180) % 360;
                } else if(id === "triadic-1") {
                    h = (+hNumberElement.value + 240) % 360;
                } else if(id === "triadic-2") {
                    h = (+hNumberElement.value + 120) % 360;
                }
                hSliderElement.value = hNumberElement.value = h;
                setH();
                setS();
                setL();
                setColor();
            };
        } else if(options.schemeClickBGChange) {
            scheme[0].onclick = scheme[1].onclick = scheme[2].onclick = function() {
                var bgColor = rgbToHex(this.style.backgroundColor);
                setBackgroundColorTo(bgColor, isDark(bgColor.substring(1)));
            };
        }

        if(options.randomVisible) {
            document.getElementById("random").style.display = "block";
            document.getElementById("random").onclick = setRandomColor;
        }
        if(options.settingsVisible) {
            document.getElementById("settings").style.display = "block";
        }

        document.body.style.fontSize = Math.floor(options.fontsize)/100 + "em";
        document.body.style.fontFamily = options.fontfamily;

        if(options.startColor === "random") {
            setRandomColor();
        } else { // if user set startColor to be a hex color
            console.log(options.startColor);
            var rgb = hexToRgb(options.startColor.slice(1));
            var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            console.table(hsl);
            setColorToHsl(Math.round(hsl.h*10)/10, Math.round(hsl.s*10)/10, Math.round(hsl.l*10)/10);
        }
        if(chrome.extension.inIncognitoContext) { // incognito mode
            if(options.startBgColorIncognito === "random") {
                var randomHsl = randomHSL();
                var hex = hslToHex(randomHsl.h, randomHsl.s, randomHsl.l);
                setBackgroundColorTo("#" + hex, isDark(hex));
            } else if(options.startBgColorIncognito === "match") {
                setBackgroundColor();
            } else if(options.startBgColorIncognito === "#222222") {
                setBackgroundColorTo("#222", "dark");
            } else { // if user set startBgColor to be a hex color
                var hex = options.startBgColor.slice(1);
                setBackgroundColorTo(options.startBgColor, isDark(hex));
            }
        } else { // normal browser mode
            if(options.startBgColor === "match") {
                setBackgroundColor();
            } else if(options.startBgColor === "random") {
                var randomHsl = randomHSL();
                var hex = hslToHex(randomHsl.h, randomHsl.s, randomHsl.l);
                setBackgroundColorTo("#" + hex, isDark(hex));
            } else { // if user set startBgColor to be a hex color
                var hex = options.startBgColor.slice(1);
                setBackgroundColorTo(options.startBgColor, isDark(hex));
            }
        }
    });

    hSliderElement.oninput = function() {
        hNumberElement.value = this.value;
        setS();
        setL();
        setColor();
    };
    hNumberElement.oninput = function() {
        var val = constrainValue(this.value, 0, 360);
        hNumberElement.value = hSliderElement.value = val;
        setS();
        setL();
        setColor();
    };

    sSliderElement.oninput = function() {
        sNumberElement.value = this.value;
        setH();
        setL();
        setColor();
    };
    sNumberElement.oninput = function() {
        var val = constrainValue(this.value, 0, 100);
        sNumberElement.value = sSliderElement.value = val;
        setH();
        setL();
        setColor();
    };

    lSliderElement.oninput = function() {
        lNumberElement.value = this.value;
        setH();
        setS();
        setColor();
    };
    lNumberElement.oninput = function() {
        var val = constrainValue(this.value, 0, 100);
        lNumberElement.value = lSliderElement.value = val;
        setH();
        setS();
        setColor();
    };

    function setColor() {
        var colorSampleElement = document.getElementById("color");
        var hex = hslToHex(hNumberElement.value, sNumberElement.value, lNumberElement.value);
        colorSampleElement.style.background = "#" + hex;
        if(options.sampleHexVisible) {
            document.getElementById("colorhex").innerHTML = "#" + hex;
        }
        if(options.sampleNameVisible) {
            var ntcMatch = ntc.name("#" + hex);
            var namedColor = ntcMatch[1];
            document.getElementById("named-color").innerHTML = namedColor;
        }
        colorSampleElement.className = isDark(hex);
        if(options.schemeVisible) {
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
        sSliderElement.style.background = "linear-gradient(to right, hsl(" + hNumberElement.value + ",0%," + lNumberElement.value + "%), hsl(" + hNumberElement.value + ",100%," + lNumberElement.value + "%))";
    }
    function setL() {
        lSliderElement.style.background = "linear-gradient(to right, hsl(" + hNumberElement.value + "," + sNumberElement.value + "%,0%), hsl(" + hNumberElement.value + "," + sNumberElement.value + "%,50%), hsl(" + hNumberElement.value + "," + sNumberElement.value + "%,100%))";
    }

    function setRandomColor() {
        var randomColor = randomHSL();
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
        var hex = hslToHex(hNumberElement.value, sNumberElement.value, lNumberElement.value);
        setBackgroundColorTo("#" + hex, isDark(hex));
    }

    function setBackgroundColorTo(hex, isdark) {
        document.body.style.backgroundColor = hex;
        document.body.className = isdark;
    }

    function setScheme() {
        var scheme = document.getElementsByClassName("color");
        // [0] = #complementary
        // [1] = #triadic-1
        // [2] = #triadic-2
        var hex = [
            hslToHex((+hNumberElement.value + 180) % 360, sNumberElement.value, lNumberElement.value),
            hslToHex((+hNumberElement.value + 240) % 360, sNumberElement.value, lNumberElement.value),
            hslToHex((+hNumberElement.value + 120) % 360, sNumberElement.value, lNumberElement.value)
        ];

        scheme[0].style.backgroundColor = "#" + hex[0];
        scheme[1].style.backgroundColor = "#" + hex[1];
        scheme[2].style.backgroundColor = "#" + hex[2];
        if(options.schemeHexVisible) {
            scheme[0].innerHTML = "#" + hex[0];
            scheme[1].innerHTML = "#" + hex[1];
            scheme[2].innerHTML = "#" + hex[2];

            scheme[0].className = "color " + isDark(hex[0]);
            scheme[1].className = "color " + isDark(hex[1]);
            scheme[2].className = "color " + isDark(hex[2]);
        }
    }
};

function hslToHex(h, s, l) {
    var hex = hslToRgb(h, s, l);
    ["r", "g", "b"].forEach(function(c) {
        hex[c] = Math.round(hex[c]).toString(16);
        if(hex[c].length === 1) {
            hex[c] = "0" + hex[c];
        }
    });
    var hexCode = hex.r + hex.g + hex.b;
    return options.uppercaseHex ? hexCode.toUpperCase() : hexCode;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var diff = max - min;
	var h = 0;
    var s = 0;
    var l = (min + max) / 2;
	if(diff != 0) {
        if(l < 0.5) {
            s = diff / (max + min);
        } else {
            s = diff / (2 - max - min);
        }
        if(r == max) {
            h = (g - b) / diff;
        } else if(g == max) {
            h = 2 + (b - r) / diff;
        } else {
            h = 4 + (r - g) / diff;
        }
	}
	return {
        h: (h*60 + 360) % 360,
        s: s*100,
        l: l*100
    };
}

function hslToRgb(h, s, l) {
    var m1, m2, hue;
    var r, g, b;
    s /= 100;
    l /= 100;
    if (s === 0) {
        r = g = b = (l * 255);
    } else {
        if (l <= 0.5) {
            m2 = l * (s + 1);
        } else {
            m2 = l + s - l * s;
        }
        m1 = l * 2 - m2;
        hue = h / 360;
        r = hueToRgb(m1, m2, hue + 1/3);
        g = hueToRgb(m1, m2, hue);
        b = hueToRgb(m1, m2, hue - 1/3);
    }
    return {
        r: r,
        g: g,
        b: b
    };
}

function hueToRgb(m1, m2, hue) {
    var v;
    if(hue < 0) {
        hue++;
    } else if(hue > 1) {
        hue--;
    }
    if(6*hue < 1) {
        v = m1 + (m2 - m1) * hue * 6;
    } else if(2*hue < 1) {
        v = m2;
    } else if(3*hue < 2) {
        v = m1 + (m2 - m1) * (2/3 - hue) * 6;
    } else {
        v = m1;
    }
    return v*255;
}

// rgb in format rgb(R, G, B) to lowercase hex with preceding #
function rgbToHex(rgb) {
    var split = rgb.slice(4, -1).split(", ");
    for(var i = 0; i < split.length; i++) {
        split[i] = (+split[i]).toString(16);
        if(split[i].length < 2) {
            split[i] += "0";
        }
    }
    return "#" + (split[0] + split[1] + split[2]);
}

// hex without preceding # to rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

// not totally random, because it chooses a pleasant color
function randomHSL() {
    return {
        h: Math.floor(Math.random()*360),
        s: Math.floor(Math.random()*40)+60,
        l: Math.floor(Math.random()*40)+30
    };
}

// uses CCIR 601 luma coefficients
// input in RRGGBB, no starting #
function isDark(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    var lightness = (0.299*r + 0.587*g + 0.114*b)/255;
    return (lightness > 0.45) ? "light" : "dark";
}

function constrainValue(value, minValue, maxValue) {
    if(value < minValue) {
        return minValue;
    }
    if(value > maxValue) {
        return maxValue
    }
    return value;
}
