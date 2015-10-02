window.onload = function() {
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

    setRandomColor();

    color.h.oninput = function() {
        num.h.value = color.h.value;
        setS();
        setL();
        setColor();
    };
    num.h.oninput = function() {
        color.h.value = num.h.value;
        setS();
        setL();
        setColor();
    };

    color.s.oninput = function() {
        num.s.value = color.s.value;
        setH();
        setL();
        setColor();
    };
    num.s.oninput = function() {
        color.s.value = num.s.value;
        setH();
        setL();
        setColor();
    };

    color.l.oninput = function() {
        num.l.value = color.l.value;
        setH();
        setS();
        setColor();
    };
    num.l.oninput = function() {
        color.l.value = num.l.value;
        setH();
        setS();
        setColor();
    };

    function setColor() {
        var rgb = hslToHex(color.h.value, color.s.value, color.l.value);
        document.getElementById("color").style.background = document.getElementById("color").innerHTML = rgb;
        document.getElementById("color").style.color = (color.l.value > 30) ? "#111" : "#999";
    }

    function setH() {
        color.h.style.background = "linear-gradient(to right,hsl(0," + color.s.value + "%," + color.l.value + "%),hsl(60," + color.s.value + "%," + color.l.value + "%),hsl(120," + color.s.value + "%," + color.l.value + "%),hsl(180," + color.s.value + "%," + color.l.value + "%),hsl(240," + color.s.value + "%," + color.l.value + "%),hsl(300," + color.s.value + "%," + color.l.value + "%),hsl(360," + color.s.value + "%," + color.l.value + "%))";
    }
    function setS() {
        color.s.style.background = "linear-gradient(to right, hsl(" + color.h.value + ",0%," + color.l.value + "%), hsl(" + color.h.value + ",100%," + color.l.value + "%))";
    }
    function setL() {
        color.l.style.background = "linear-gradient(to right, hsl(" + color.h.value + "," + color.s.value + "%,0%), hsl(" + color.h.value + "," + color.s.value + "%,50%), hsl(" + color.h.value + "," + color.s.value + "%,100%))";
    }

    function setRandomColor() {
        color.h.value = num.h.value = Math.floor(Math.random()*360);
        color.s.value = num.s.value = Math.floor(Math.random()*50)+50;
        color.l.value = num.l.value = Math.floor(Math.random()*40)+30;
        setH();
        setS();
        setL();
        setColor();
    }

    document.getElementById("random").onclick = setRandomColor;

    function hslToHex(h, s, l) {
        var hex = hslToRgb(h, s, l);

        ["r", "g", "b"].forEach(function(c) {
            hex[c] = Math.round(hex[c]).toString(16).toUpperCase();
            if(hex[c].length < 2) hex[c] = "0" + hex[c];
        });

        return "#" + hex.r + hex.g + hex.b;
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
};
