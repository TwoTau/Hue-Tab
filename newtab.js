let options = {};

class SliderNumberElement {
    constructor(sliderEl, numberEl, type, callback) {
        this.slider = sliderEl;
        this.number = numberEl;
        this.type = type;
        console.assert(viewFuncs[type], `Type ${type} is not in viewFuncs`);

        this.slider.oninput = (e) => {
            let val = viewFuncs[type].mapInput(e);
            this.val = val;
            callback();
        }
    }

    get val() {
        return +this.number.value;
    }
    set val(newVal) {
        this.number.value = +newVal;
        this.slider.value = +newVal;
    }

    render() {
        viewFuncs[this.type].setBackground(this);
    }
}

const viewFuncs = {
    h: {
        mapInput: (e) => {
            return util.clamp(e.target.value, 0, 360);
        },
        setBackground: (self) => {
            const sl = `${view.s.val}%,${view.l.val}%`;
            self.slider.style.background = `linear-gradient(to right, hsl(0,${sl}), hsl(60,${sl}), hsl(120,${sl}), hsl(180,${sl}), hsl(240,${sl}), hsl(300,${sl}), hsl(360,${sl}))`;
        },
    },
    s: {
        mapInput: (e) => {
            return util.clamp(e.target.value, 0, 100);
        },
        setBackground: (self) => {
            const h = view.h.val;
            const l = view.l.val;
            self.slider.style.background = `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`;
        },
    },
    l: {
        mapInput: (e) => {
            return util.clamp(e.target.value, 0, 100);
        },
        setBackground: (self) => {
            const hs = `${view.h.val},${view.s.val}%`;
            self.slider.style.background = `linear-gradient(to right, hsl(${hs},0%), hsl(${hs},50%), hsl(${hs},100%))`;
        },
    },
}

const view = {
    h: null,
    s: null,
    l: null,
    mainColor: null,
    schemes: null,
    schemeContainer: null,
    mainColorHex: null,
    mainColorName: null,
    random: null,
    settings: null,
};

window.onload = () => {
    const outputElements = document.getElementsByClassName("output");
    const hNumberElement = outputElements[0];
    const sNumberElement = outputElements[1];
    const lNumberElement = outputElements[2];

    const hSliderElement = document.querySelector(".picker .hue");
    const sSliderElement = document.querySelector(".picker .saturation");
    const lSliderElement = document.querySelector(".picker .lightness");

    view.h = new SliderNumberElement(hSliderElement, hNumberElement, 'h', setColor);
    view.s = new SliderNumberElement(sSliderElement, sNumberElement, 's', setColor);
    view.l = new SliderNumberElement(lSliderElement, lNumberElement, 'l', setColor);

    view.mainColor = document.querySelector(".main-color");
    view.schemeContainer = document.querySelector(".scheme");
    view.schemes = document.querySelectorAll(".scheme .color");

    view.mainColorHex = document.querySelector(".main-color-hex");
    view.mainColorName = document.querySelector(".main-color-name");

    view.random = document.querySelector(".random");
    view.settings = document.querySelector(".settings");

    chrome.storage.sync.get({
        "clickBGChange": true,
        "sampleHexVisible": true,
        "sampleHexEditable": true,
        "clickCopyHex": false,
        "sampleNameVisible": false,
        "schemeVisible": true,
        "schemeHexVisible": true,
        "schemeClickSampleChange": false,
        "schemeClickBGChange": false,
        "randomVisible": true,
        "settingsVisible": true,
        "fontfamily": "Helvetica",
        "fontsize": 100,
        "uppercaseHex": true,
        "startColor": "random",
        "startBgColor": "random",
        "startBgColorIncognito": "#222222"
    }, (items) => {
        options = items;

        if (options.clickBGChange || options.clickCopyHex) {
            view.mainColor.addEventListener("click", (e) => {
                if (!(e.target === view.mainColorHex && options.sampleHexEditable)) {
                    if (options.clickCopyHex) {
                        view.mainColorHex.select();
                        document.execCommand("copy");
                    }
                    if (options.clickBGChange) {
                        setBackgroundColor();
                    }
                }
            });
            view.mainColor.classList.add("clickable");

            if (options.clickCopyHex) {
                view.mainColor.title = "Click to copy hex";
            }
        }

        if (options.sampleHexVisible) {
            view.mainColorHex.style.display = "inline-block";
        } else {
            // delete the element
            view.mainColorHex.outerHTML = "";
        }
        if (options.sampleNameVisible) {
            view.mainColorName.style.display = "block";
        } else {
            // delete the element
            view.mainColorName.outerHTML = "";
        }

        if (options.schemeVisible) {
            view.schemeContainer.style.display = "flex";
        }

        if (options.schemeClickSampleChange || options.schemeClickBGChange) {
            const onclick = (e) => {
                if (options.schemeClickBGChange) {
                    let bgColor = util.rgbToHex(e.target.style.backgroundColor);
                    setBackgroundColorTo(bgColor, util.isDark(bgColor));
                }

                if (options.schemeClickSampleChange) {
                    const id = e.target.getAttribute("id");
                    let h = view.h.val;
                    if (id === "complementary") {
                        h += 180;
                    } else if (id === "triadic-1") {
                        h += 240;
                    } else if (id === "triadic-2") {
                        h += 120;
                    }
                    h %= 360;
                    view.h.val = h;
                    setColor();
                }
            };
            for (let schemeEl of view.schemes) {
                schemeEl.addEventListener("click", onclick);
                schemeEl.classList.add("clickable");
            }
        }

        if (options.randomVisible) {
            view.random.style.display = "block";
            view.random.onclick = setRandomColor;
        }
        if (options.settingsVisible) {
            view.settings.style.display = "block";
            // view.settings.addEventListener("click", (e) => {
            //     if (chrome.runtime.openOptionsPage) {
            //         chrome.runtime.openOptionsPage();
            //     } else {
            //         window.open(chrome.runtime.getURL('options.html'));
            //     }
            //     e.preventDefault();
            // });
        }

        if (options.sampleHexEditable) {
            view.mainColorHex.addEventListener("input", (e) => {
                let val = "#" + e.target.value.replaceAll(/[^0-9A-F]/ig, '');
                val = options.uppercaseHex ? val.toUpperCase() : val.toLowerCase();
                view.mainColorHex.value = val;

                const isValid = /^#[0-9A-F]{6}$/i.test(val);

                if (isValid) {
                    let hex = val.slice(1);
                    let rgb = util.hexToRgb(hex);
                    let hsl = util.rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setColorToHsl(Math.round(hsl.h * 10) / 10, Math.round(hsl.s * 10) / 10, Math.round(hsl.l * 10) / 10);
                } else {
                    view.mainColorHex.classList.add("invalid");
                }
            });

            // needed to allow three hex shorthand
            view.mainColorHex.addEventListener("change", (e) => {
                let val = e.target.value;
                if (/^#[0-9A-F]{3}$/i.test(val)) { // is shorthand (three hex)
                    let hex = val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
                    view.mainColorHex.value = "#" + hex;
                    let rgb = util.hexToRgb(hex);
                    let hsl = util.rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setColorToHsl(Math.round(hsl.h * 10) / 10, Math.round(hsl.s * 10) / 10, Math.round(hsl.l * 10) / 10);
                }
            });
        } else {
            view.mainColorHex.readOnly = true;
            view.mainColorHex.classList.remove("editable");
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
                let hex = options.startBgColorIncognito.slice(1);
                setBackgroundColorTo(options.startBgColorIncognito, util.isDark(hex));
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

    function setColor() {
        let hex = util.hslToHex(view.h.val, view.s.val, view.l.val);
        view.mainColor.style.background = "#" + hex;
        if (options.sampleHexVisible) {
            view.mainColorHex.value = "#" + hex;
        }
        if (options.sampleHexEditable) {
            view.mainColorHex.classList.remove("invalid");
        }
        if (options.sampleNameVisible) {
            let ntcMatch = ntc.name("#" + hex);
            let namedColor = ntcMatch[1];
            view.mainColorName.innerHTML = namedColor;
        }
        view.mainColor.dataset.isDark = util.isDark(hex);
        if (options.schemeVisible) {
            setScheme();
        }

        view.h.render();
        view.s.render();
        view.l.render();
    }


    function setRandomColor() {
        let randomColor = util.randomHsl();
        setColorToHsl(randomColor.h, randomColor.s, randomColor.l);
    }

    function setColorToHsl(h, s, l) {
        view.h.val = h;
        view.s.val = s;
        view.l.val = l;
        setColor();
    }

    function setBackgroundColor() {
        let hex = util.hslToHex(view.h.val, view.s.val, view.l.val);
        setBackgroundColorTo("#" + hex, util.isDark(hex));
    }

    function setBackgroundColorTo(hex, isdark) {
        document.body.style.backgroundColor = hex;
        document.body.className = isdark;
    }

    function setScheme() {
        // [0] = #complementary
        // [1] = #triadic-1
        // [2] = #triadic-2
        let hex = [
            util.hslToHex((view.h.val + 180) % 360, view.s.val, view.l.val),
            util.hslToHex((view.h.val + 240) % 360, view.s.val, view.l.val),
            util.hslToHex((view.h.val + 120) % 360, view.s.val, view.l.val)
        ];

        for (let i = 0; i < view.schemes.length; i++) {
            view.schemes[i].style.backgroundColor = "#" + hex[i];

            if (options.schemeHexVisible) {
                view.schemes[i].innerHTML = "#" + hex[i];
                view.schemes[i].dataset.isDark = util.isDark(hex[i]);
            }
        }
    }
};