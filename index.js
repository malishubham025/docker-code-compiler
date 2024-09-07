const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Function to run a command and return a promise
const runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            if (stderr) {
                return reject(stderr);
            }
            resolve(stdout);
        });
    });
};

app.post("/", async (req, res) => {
    let code = req.body.code; // User's code from request
    let tempFilePath = "index.cpp";

    try {
        // Step 1: Write code to index.cpp
        await new Promise((resolve, reject) => {
            fs.writeFile(tempFilePath, code, (err) => {
                if (err) {
                    return reject('Error writing to temporary file');
                }
                resolve();
            });
        });

        // Step 2: Copy index.cpp into the Docker container
        await runCommand(`docker cp ${tempFilePath} test2:/app/index.cpp`);
        console.log('Code copied to Docker container successfully.');

        // Step 3: Compile the code in the container
        await runCommand(`docker exec test2 g++ /app/index.cpp -o /app/index2`);
        console.log('Code compiled successfully.');

        // Step 4: Execute the compiled binary
        const output = await runCommand(`docker exec test2 /app/index2`);
        console.log(`Program output: ${output}`);

        // Step 5: Send the output to the client
        res.json({ "output": output });
        
    } catch (error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.listen(3000, () => {
    console.log("running");
});

// const express = require("express");
// const { exec } = require("child_process");
// const fs = require("fs");
// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Function to run a command and return a promise
// const runCommand = (command, options = {}) => {
//     return new Promise((resolve, reject) => {
//         const process = exec(command, options, (error, stdout, stderr) => {
//             if (error) {
//                 return reject(error);
//             }
//             if (stderr) {
//                 return reject(stderr);
//             }
//             resolve(stdout);
//         });

//         // Pass input interactively
//         if (options.stdinData) {
//             process.stdin.write(options.stdinData);
//             process.stdin.end();
//         }
//     });
// };

// app.post("/compile", async (req, res) => {
//     let code = req.body.code; // User's code from request
//     let input = req.body.input; // Input to provide to the program
//     let tempFilePath = "index.cpp";

//     try {
//         // Step 1: Write code to index.cpp
//         await new Promise((resolve, reject) => {
//             fs.writeFile(tempFilePath, code, (err) => {
//                 if (err) {
//                     return reject('Error writing to temporary file');
//                 }
//                 resolve();
//             });
//         });

//         // Step 2: Copy index.cpp into the Docker container
//         await runCommand(`docker cp ${tempFilePath} test2:/app/index.cpp`);
//         console.log('Code copied to Docker container successfully.');

//         // Step 3: Compile the code in the container
//         await runCommand(`docker exec test2 g++ /app/index.cpp -o /app/index2`);
//         console.log('Code compiled successfully.');

//         // Step 4: Execute the compiled binary interactively
//         const output = await runCommand(`docker exec -i test2 /app/index2`, {
//             stdinData: input + '\n' // Pass input directly to the executable
//         });
//         console.log(`Program output: ${output}`);

//         // Step 5: Send the output to the client
//         res.json({ "output": output });

//     } catch (error) {
//         console.error(`Error: ${error}`);
//         res.status(500).json({ "error": "Internal Server Error" });
//     }
// });

// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });

