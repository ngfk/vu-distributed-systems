const { join } = require('path');
const { spawn } = require('child_process');
const glob = require('glob');

/**
 * @param {string} libDir
 * @return {string[]}
 */
const getJarFiles = libDir => {
    return new Promise((resolve, reject) => {
        glob(libDir + '/**/*.jar', {}, (err, files) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(files);
        });
    });
};

const main = async () => {
    try {
        const mainFile = process.argv[2];
        const libDir = join(__dirname, 'ds-grid/lib');
        const binDir = join(__dirname, 'ds-grid/bin');

        const jars = await getJarFiles(libDir);
        const classpath = [binDir, ...jars].join(':');

        const args = ['-cp', classpath, mainFile];

        spawn('java', args, { stdio: 'inherit' });
        spawn('http-server', ['--port', process.env.port || 3000], {
            stdio: 'inherit',
            cwd: join(__dirname, 'ds-site/build')
        });
    } catch (error) {
        console.log(error);
    }
};

// Run main if targeted directly
(() => require.main === module && main())();
