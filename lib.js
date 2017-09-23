const { exit, stderr, stdout } = require('process');
const { exec } = require('child_process');
const constants = require('./constants.js');

const writeErr = stderr.write.bind(stderr);
const writeOut = stdout.write.bind(stdout);

function sh(cmd, onErr = writeErr, onOut = writeOut) {
	return new Promise(async (resolve, reject) => {
		let out = '';
		let err = '';
		let p = exec(cmd, sh.options);

		p.stdout.on('data', data => {
			out += data;
			onOut(data);
		});

		p.stderr.on('data', data => {
			err += data;
			onErr(data);
		});

		p.on('close', code => {
			resolve({ code, out, err });
		});
	});
} // fn

sh.options = {
	shell: 'bash',
};

function stringify(val) {
	return typeof val === 'string' ? val : JSON.stringify(val);
}

sh.all = function (cmds) {
	if (!(cmds instanceof Array))
		cmds = arugments;

	let ps = [];
	let id = 0;

	for (cmd of cmds) {
		let cc = 31 + id%6;
		let tag = '[\033[0;' + cc + 'm' + ++id + '\033[0;39m] ';

		let onErr = str => stderr.write(str.replace(/^(?=.)/mg, tag));
		let onOut = str => stdout.write(str.replace(/^(?=.)/mg, tag));

		ps.push(sh(cmd, onErr, onOut));
	}

	return Promise.all(ps);
}

sh.echo = val => {
	let msg = stringify(val).replace(/"/g, '\\"');
	return sh(`echo -e "${msg}"`);
}; // fn

sh.esc = constants.escCode;
sh.err = val => stderr.write(stringify(val));
sh.out = val => stdout.write(stringify(val));
sh.exit = exit;

module.exports = sh;

