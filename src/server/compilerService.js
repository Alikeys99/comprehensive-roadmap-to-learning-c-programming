const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3001;

// Temporary directory for compilation
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

app.post('/compile', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const fileName = `temp_${Date.now()}`;
    const cFilePath = path.join(tempDir, `${fileName}.c`);
    const wasmFilePath = path.join(tempDir, `${fileName}.wasm`);

    try {
        // Write C code to temporary file
        fs.writeFileSync(cFilePath, code);

        // Compile using Emscripten
        exec(`emcc ${cFilePath} -o ${wasmFilePath} -s WASM=1`, 
            (error, stdout, stderr) => {
                if (error) {
                    return res.status(500).json({ 
                        error: 'Compilation failed',
                        details: stderr
                    });
                }

                // Read the compiled WASM file
                const wasmBuffer = fs.readFileSync(wasmFilePath);
                res.json({
                    wasm: wasmBuffer.toString('base64'),
                    output: stdout
                });

                // Clean up
                fs.unlinkSync(cFilePath);
                fs.unlinkSync(wasmFilePath);
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Compiler service running on port ${PORT}`);
});
