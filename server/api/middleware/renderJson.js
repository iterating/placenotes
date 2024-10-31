import express from "express";

const renderPrettyJson = (req, res, next) => {
  res.renderJson = (jsonData) => {
    const jsonHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JSON Viewer</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>JSON Data</h1>
        <pre>${JSON.stringify(jsonData, null, 2)}</pre>
      </body>
      </html>
    `;
    res.send(jsonHtml);
  };
  next();
};

export default renderPrettyJson;
