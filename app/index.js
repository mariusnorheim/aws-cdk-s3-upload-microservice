const AWS = require("aws-sdk");
const fs = require("fs");
const archiver = require("archiver");

const zipDirectory = (source, out) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on("error", (err) => reject(err))
            .pipe(stream)
            .on("close", () => resolve())
            .on("error", (err) => reject(err)); // Handle stream errors

        archive.finalize();
    });
};

const invokeLambda = async (zipFilePath, s3Prefix, lambdaFunctionName) => {
    const lambda = new AWS.Lambda();

    let zipBuffer;
    try {
        zipBuffer = fs.readFileSync(zipFilePath);
    } catch (error) {
        throw new Error(`Failed to read zip file: ${error.message}`);
    }

    const encodedData = zipBuffer.toString("base64");

    const payload = {
        prefix: s3Prefix,
        files: {
            "zippedFolder.zip": encodedData,
        },
    };

    const params = {
        FunctionName: lambdaFunctionName,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify(payload),
    };

    try {
        const response = await lambda.invoke(params).promise();
        if (response.FunctionError) {
            throw new Error(response.Payload);
        }
        return response;
    } catch (error) {
        throw new Error(`Failed to invoke Lambda function: ${error.message}`);
    }
};

const main = async () => {
    const directoryToZip = "./yourDirectoryPathHere";
    const zipOutputPath = "./output.zip";
    const s3Prefix = "your-s3-prefix-here";
    const lambdaFunctionName = "YourLambdaFunctionNameHere";

    try {
        await zipDirectory(directoryToZip, zipOutputPath);
        const response = await invokeLambda(zipOutputPath, s3Prefix, lambdaFunctionName);
        console.log("Lambda response: ", response.Payload);
    } catch (error) {
        console.error("Error: ", error.message);
    }
};

main();
