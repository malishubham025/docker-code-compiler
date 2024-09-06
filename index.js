const express = require("express");
const { exec } = require("child_process"); // Import exec from child_process

const app = express();
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Handling GET request
app.get("/", (req, res) => {
    res.json({ "code": "hello" });
});

// Handling POST request with form-data
app.post("/", (req, res) => {
    let code = req.body.code; // Assuming code is provided in the request body
    let command = "docker exec test2 g++ /app/index.cpp -o /app/index";
    // Run the C++ binary and handle the output
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ "error": "Internal Server Error" });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ "error": "Internal Server Error" });
        }
       
    });
    command="docker exec test2 /app/index"
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ "error": "Internal Server Error" });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ "error": "Internal Server Error" });
        }
        console.log(`stdout: ${stdout}`);
        res.json({ "output": stdout });
    });

});

app.listen(3000, () => {
    console.log("running");
});
