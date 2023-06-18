const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const websiteUrl = 'https://www.nobroker.in/flats-for-sale-in-koramangala_bangalore';

// Function to fetch the property age from the property URL
async function getPropertyAge(propertyUrl) {
  try {
    const response = await axios.get(propertyUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const propertyAgeElement = $('.property-detail .property-age');
    const propertyAge = propertyAgeElement.text().trim();
    return propertyAge;
  } catch (error) {
    console.error('Error fetching property age:', error.message);
    return 'N/A';
  }
}

// Function to generate the HTML file with the property details
function generateHTML(propertyDetails) {
  const htmlContent = `
    <html>
    <head>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
        }
        
        th, td {
          text-align: left;
          padding: 8px;
        }
        
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>Property Details</h1>
      <table>
        <tr>
          <th>Area</th>
          <th>URL</th>
          <th>Property Age</th>
        </tr>
        ${propertyDetails
          .map(
            (property) => `
          <tr>
            <td>${property.area}</td>
            <td><a href="${property.url}">${property.url}</a></td>
            <td>${property.age}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </body>
    </html>
  `;

  fs.writeFile('propertyDetails.html', htmlContent, (error) => {
    if (error) {
      console.error('Error writing HTML file:', error.message);
    } else {
      console.log('propertyDetails.html file generated successfully!');
    }
  });
}

// Function to scrape the website and fetch property details
async function scrapeWebsite() {
  try {
    const response = await axios.get(websiteUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const propertyDetails = [];

    $('.card').each((index, element) => {
      const areaElement = $(element).find('.property-card-title');
      const area = areaElement.text().trim();
      const propertyUrl = areaElement.attr('href');

      propertyDetails.push({ area, url: propertyUrl });
    });

    const promises = propertyDetails.map(async (property) => {
      const propertyAge = await getPropertyAge(property.url);
      property.age = propertyAge;
      return property;
    });

    const updatedPropertyDetails = await Promise.all(promises);

    generateHTML(updatedPropertyDetails);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scrapeWebsite();
