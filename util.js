const util = {

	/**
	 * Converts HSL color into hex format.
	 * @param {number} h Hue value, 0 <= r <= 360
	 * @param {number} s Saturation value, 0 <= s <= 100
	 * @param {number} l Lightness value, 0 <= g <= 100
	 * @returns {string} hex string, without preceding #
	 */
	hslToHex(h, s, l) {
		let hex = this.hslToRgb(h, s, l);
		["r", "g", "b"].forEach((c) => {
			hex[c] = Math.round(hex[c]).toString(16);
			if (hex[c].length === 1) {
				hex[c] = "0" + hex[c];
			}
		});
		let hexCode = hex.r + hex.g + hex.b;
		return options.uppercaseHex ? hexCode.toUpperCase() : hexCode;
	},

	/**
	 * Converts RGB color into HSL. S and L values are in the range [0, 100].
	 * @param {number} r Red value, 0 <= r <= 255
	 * @param {number} g Green value, 0 <= g <= 255
	 * @param {number} b Blue value, 0 <= g <= 255
	 * @returns {{h: number, s: number, l: number}} HSL value
	 */
	rgbToHsl(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		let min = Math.min(r, g, b);
		let max = Math.max(r, g, b);
		let diff = max - min;
		let h = 0;
		let s = 0;
		let l = (min + max) / 2;
		if (diff != 0) {
			if (l < 0.5) {
				s = diff / (max + min);
			} else {
				s = diff / (2 - max - min);
			}
			if (r == max) {
				h = (g - b) / diff;
			} else if (g == max) {
				h = 2 + (b - r) / diff;
			} else {
				h = 4 + (r - g) / diff;
			}
		}
		return {
			h: (h * 60 + 360) % 360,
			s: s * 100,
			l: l * 100
		};
	},

	/**
	 * Converts HSL color into RGB. All RGB values are in the range [0, 255]
	 * @param {number} h Hue value, 0 <= r <= 360
	 * @param {number} s Saturation value, 0 <= s <= 100
	 * @param {number} l Lightness value, 0 <= g <= 100
	 * @returns {{r: number, g: number, b: number}} RGB value
	 */
	hslToRgb(h, s, l) {
		let m1, m2, hue;
		let r, g, b;
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
			r = this._hueToRgb(m1, m2, hue + 1 / 3);
			g = this._hueToRgb(m1, m2, hue);
			b = this._hueToRgb(m1, m2, hue - 1 / 3);
		}
		return {
			r: r,
			g: g,
			b: b
		};
	},

	// Helper function for hslToRgb
	_hueToRgb(m1, m2, hue) {
		let v;
		if (hue < 0) {
			hue++;
		} else if (hue > 1) {
			hue--;
		}
		if (6 * hue < 1) {
			v = m1 + (m2 - m1) * hue * 6;
		} else if (2 * hue < 1) {
			v = m2;
		} else if (3 * hue < 2) {
			v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
		} else {
			v = m1;
		}
		return v * 255;
	},

	/**
	 * Converts RGB color string into #hex format.
	 * @param {string} rgb RGB color in format 'rgb(R, G, B)' (with spaces)
	 * @returns {string} lowercase hex color with preceding #
	 */
	rgbToHex(rgb) {
		let split = rgb.slice(4, -1).split(", ");
		for (let i = 0; i < split.length; i++) {
			split[i] = (+split[i]).toString(16);
			if (split[i].length < 2) {
				split[i] += "0";
			}
		}
		return "#" + (split[0] + split[1] + split[2]);
	},

	/**
	 * Converts hex color string into RGB format. Case-insensitive.
	 * @param {string} hex Hex color string, with or without preceding #
	 * @returns {{r: number, g: number, b: number}} RGB value
	 */
	hexToRgb(hex) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.toLowerCase());
		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		};
	},

	/**
	 * Returns a pleasantish randomish color.
	 * @returns {{h: number, s: number, l: number}} HSL value, 0 <= S, L <= 100
	 */
	randomHsl() {
		return {
			h: Math.floor(Math.random() * 360),
			s: Math.floor(Math.random() * 40) + 60,
			l: Math.floor(Math.random() * 40) + 30
		};
	},

	/**
	 * Uses CCIR 601 luma coefficients to estimate whether a color is dark or light.
	 * @param {string} hex Hex color string, with or without preceding #
	 * @returns {string} "dark" if color is dark, else "light"
	 */
	isDark(hex) {
		let { r, g, b } = this.hexToRgb(hex);
		let lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return (lightness > 0.45) ? "light" : "dark";
	},

	/**
	 * Constraints a value to be within the given range.
	 * @param {number} value number to constraint
	 * @param {number} minValue lower end of range
	 * @param {number} maxValue higher end of range
	 */
	clamp(value, minValue, maxValue) {
		if (value < minValue) {
			return minValue;
		}
		if (value > maxValue) {
			return maxValue
		}
		return value;
	}
};