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
        document.getElementById("color").style.background = "hsl(" + color.h.value + "," + color.s.value + "%," + color.l.value + "%)";
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
        var rgb = hslToRgb(color.h.value, color.s.value, color.l.value);
        document.getElementById("color").setAttribute("data-color", rgb);
    }

    document.getElementById("random").onclick = function() {
        setRandomColor();
    };

    function hslToRgb(h, s, l) {
        var r = 0,
            g = 0,
            b = 0;

        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
};
