export const renderJson = (req, res, next) => {
  try {
    const data = req.body.data;

    if (!data) {
      return res.status(400).send({ message: "No data provided" });
    }

    const formattedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Formatted Data</title>
      </head>
      <body>
          <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
      </html>
    `;

    res.status(200).send(formattedHtml);
  } catch (error) {
    console.error("Error rendering HTML:", error);
    res.status(500).send({ message: "An error occurred while rendering HTML" });
  }
};

export default renderJson;
