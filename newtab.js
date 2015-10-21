window.onload = function() {
    var options = {};

    var color = {
        h: document.getElementById("hue"),
        s: document.getElementById("saturation"),
        l: document.getElementById("lightness")
    };
    var num = {
        h: document.getElementsByClassName("output")[0],
        s: document.getElementsByClassName("output")[1],
        l: document.getElementsByClassName("output")[2]
    };

    chrome.storage.sync.get({
        "clickBGChange": true,
        "sampleHexVisible": true,
        "schemeVisible": true,
        "schemeHexVisible": true,
        "randomVisible": true,
        "fontfamily": "Open Sans",
        "fontsize": 100,
        "uppercaseHex": true,
        "startColor": "random",
        "startBgColor": "#FFFFFF"
    }, function(items) {
        options = items;
        if(!items.randomVisible) document.getElementById("random").style.display = "none";
        document.body.style.fontSize = Math.floor(items.fontsize)/100 + "em";
        document.body.style.fontFamily = items.fontfamily;
        if(items.schemeVisible) document.getElementById("scheme").style.display = "block";

        if(items.startColor === "random") {
            setRandomColor();
        } else { // if user set startColor to be a hex color

        }
        if(items.startBgColor === "match") {
            setBackgroundColor();
        } else if(items.startBgColor === "random") {

        } else { // if user set startBgColor to be a hex color

        }
    });

    color.h.oninput = function() {
        num.h.value = this.value;
        setS();
        setL();
        setColor();
    };
    num.h.oninput = function() {
        color.h.value = this.value;
        setS();
        setL();
        setColor();
    };

    color.s.oninput = function() {
        num.s.value = this.value;
        setH();
        setL();
        setColor();
    };
    num.s.oninput = function() {
        color.s.value = this.value;
        setH();
        setL();
        setColor();
    };

    color.l.oninput = function() {
        num.l.value = this.value;
        setH();
        setS();
        setColor();
    };
    num.l.oninput = function() {
        color.l.value = this.value;
        setH();
        setS();
        setColor();
    };

    function setColor() {
        var colorSample = document.getElementById("color");
        var hex = hslToHex(num.h.value, num.s.value, num.l.value);
        colorSample.style.background = "#" + hex;
        colorSample.innerHTML = hex;
        colorSample.className = document.getElementById("scheme").className = isDark(num.l.value) ? "light" : "dark";
        setScheme();
    }

    function setH() {
        color.h.style.background = "linear-gradient(to right," +
            "hsl(0," + num.s.value + "%," + num.l.value + "%)," +
            "hsl(60," + num.s.value + "%," + num.l.value + "%)," +
            "hsl(120," + num.s.value + "%," + num.l.value + "%)," +
            "hsl(180," + num.s.value + "%," + num.l.value + "%)," +
            "hsl(240," + num.s.value + "%," + num.l.value + "%)," +
            "hsl(300," + num.s.value + "%," + num.l.value + "%)," +
            "hsl(360," + num.s.value + "%," + num.l.value + "%))";
    }
    function setS() {
        color.s.style.background = "linear-gradient(to right, hsl(" + num.h.value + ",0%," + num.l.value + "%), hsl(" + num.h.value + ",100%," + num.l.value + "%))";
    }
    function setL() {
        color.l.style.background = "linear-gradient(to right, hsl(" + num.h.value + "," + num.s.value + "%,0%), hsl(" + num.h.value + "," + num.s.value + "%,50%), hsl(" + num.h.value + "," + num.s.value + "%,100%))";
    }

    function setRandomColor() {
        var randomColor = randomHSL();
        color.h.value = num.h.value = randomColor.h;
        color.s.value = num.s.value = randomColor.s;
        color.l.value = num.l.value = randomColor.l;
        setH();
        setS();
        setL();
        setColor();
    }

    document.getElementById("random").onclick = setRandomColor;

    function setBackgroundColor() {
        setBackgroundColorTo("#" + hslToHex(num.h.value, num.s.value, num.l.value), isDark(num.l.value));
    }

    function setBackgroundColorTo(hex, isdark) {
        document.body.style.backgroundColor = document.getElementById("container").style.borderColor = hex;
        document.body.className = (isdark) ? "light" : "dark";
    }

    document.getElementById("color").onclick = setBackgroundColor;

    function setScheme() {
        var scheme = document.getElementsByClassName("color");
        var hex = [
            hslToHex((Math.abs(num.h.value)+180)%360, num.s.value, num.l.value),
            hslToHex(Math.abs(240+num.h.value)%360, num.s.value, num.l.value),
            hslToHex(Math.abs(120+num.h.value)%360, num.s.value, num.l.value)
        ];
        scheme[0].style.backgroundColor = "#" + hex[0];
        scheme[0].innerHTML = hex[0];
        scheme[1].style.backgroundColor = "#" + hex[1];
        scheme[1].innerHTML = hex[1];
        scheme[2].style.backgroundColor = "#" + hex[2];
        scheme[2].innerHTML = hex[2];
    }
    function hslToHex(h, s, l) {
        var hex = hslToRgb(h, s, l);

        ["r", "g", "b"].forEach(function(c) {
            hex[c] = Math.round(hex[c]).toString(16);
            if(options.uppercaseHex) hex[c] = hex[c].toUpperCase();
            if(hex[c].length < 2) hex[c] = "0" + hex[c];
        });

        return hex.r + hex.g + hex.b;
    }
};

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
		hue += 1;
	} else if(hue > 1) {
		hue -= 1;
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

function randomHSL() {
    return {
        h: Math.floor(Math.random()*360),
        s: Math.floor(Math.random()*40)+60,
        l: Math.floor(Math.random()*40)+30
    };
}

function isDark(lightnessValue) {
    return lightnessValue < 35;
}
