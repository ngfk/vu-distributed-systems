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
        const mainFile = join(__dirname, process.argv[2]);
        const libDir = join(__dirname, 'ds-grid/lib');
        const outDir = join(__dirname, 'ds-grid/bin');
        const srcDir = join(__dirname, 'ds-grid/src');

        const jars = await getJarFiles(libDir);
        const classpath = jars.join(':');

        const args = [
            '-cp',
            classpath,
            '-d',
            outDir,
            '-sourcepath',
            srcDir,
            mainFile
        ];

        const javac = spawn('javac', args, { stdio: 'inherit' });
    } catch (error) {
        console.log(error);
    }
};

// Run main if targeted directly
(() => require.main === module && main())();
