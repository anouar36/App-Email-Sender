import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import moment from 'moment';
// import sendEmail from './mailSender.js';
import { fileURLToPath } from 'url';
import { 
    initializeDatabase, 
    saveEmailData, 
    getEmails, 
    getEmailStats 
} from './database.js';
import { 
    extractCompanyName, 
    formatDateTime 
} from './companyExtractor.js';
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import XLSX from 'xlsx';
import fs from 'fs';
dotenv.config({ path: ".env.auth" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Initialize database on startup
await initializeDatabase();

// n8n webhook URL
const WEBHOOK_URL = 'https://anouarechcharai.app.n8n.cloud/webhook-test/5e096381-4bde-458e-b0e6-c8d32d7ef6da';

// Send data to n8n webhook
async function sendToWebhook(data) {
  try {
    console.log('🔗 Sending data to n8n webhook...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.text();
      console.log('✅ Webhook data sent successfully');
      return true;
    } else {
      console.error(`❌ Webhook failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return false;
  }
}

// Simplified email sender function
async function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.HOSTPORT,
    secure: false,
    service: process.env.SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.PASSWORD,
    },
  });

  let delay = 0;
  const successfulEmails = [];

  // Send initial webhook data
  if (options.extractedData && options.extractedData.length > 0) {
    await sendToWebhook({
      timestamp: new Date().toISOString(),
      action: 'email_batch_started',
      total_recipients: options.recipients.length,
      sender: options.sender,
      subject: options.subject,
      extracted_companies: options.extractedData
    });
  }

  for (const recipient of options.recipients) {
    try {
      const mailOptions = {
        from: `${options.sender || "Job Applicant"} <${process.env.EMAIL_USERNAME}>`,
        to: recipient,
        subject: options.subject,
        text: options.content,
        attachments: [
          {
            filename: "Anouar-Ech-charai.pdf",
            path: "./Anouar-Ech-charai.pdf",
          },
        ],
      };

      setTimeout(async () => {
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${recipient} successfully`);
          successfulEmails.push(recipient);
          
          const emailData = options.extractedData?.find(data => data.email === recipient);
          await sendToWebhook({
            timestamp: new Date().toISOString(),
            action: 'email_sent',
            recipient: recipient,
            company: emailData?.company || 'Unknown',
            date: emailData?.date || '',
            time: emailData?.time || '',
            message_id: info.messageId,
            success: true
          });
        } catch (err) {
          console.error(`❌ Failed to send email to ${recipient}:`, err);
          await sendToWebhook({
            timestamp: new Date().toISOString(),
            action: 'email_failed',
            recipient: recipient,
            error: err.message
          });
        }
      }, delay);
      
      delay += 10000; // 10 second delay between emails
    } catch (error) {
      console.error(`Error preparing email for ${recipient}:`, error);
    }
  }

  // Send completion webhook after all emails are scheduled
  setTimeout(async () => {
    await sendToWebhook({
      timestamp: new Date().toISOString(),
      action: 'batch_completed',
      total_scheduled: options.recipients.length,
      successful_emails: successfulEmails
    });
    console.log(`📊 Email batch scheduled: ${options.recipients.length} emails`);
  }, delay + 5000);
}

app.post('/api/send', async (req, res) => {
  const { sender, subject, content, recipients } = req.body;
  
  try {
    console.log('📧 Processing email send request...');
    
    // Get current date and time
    const { date, time } = formatDateTime();
    
    // Process each recipient
    const processedEmails = [];
    
    for (const email of recipients) {
      // Extract company name using local function
      const companyName = extractCompanyName(email);
      console.log(`🏢 Extracted company: "${companyName}" from ${email}`);
      
      // Prepare email data for database
      const emailData = {
        to_email: email,
        company_name: companyName,
        subject: subject,
        body: content,
        sent_date: date,
        sent_time: time
      };
      
      // Save to database
      try {
        const dbResult = await saveEmailData(emailData);
        console.log(`💾 Email data saved to database with ID: ${dbResult.id}`);
        processedEmails.push({
          email,
          companyName,
          dbId: dbResult.id,
          status: 'saved'
        });
      } catch (dbError) {
        console.error(`❌ Database save failed for ${email}:`, dbError);
        processedEmails.push({
          email,
          companyName,
          status: 'db_error',
          error: dbError.message
        });
      }
    }
    
    // Send email using existing function
    await sendEmail({
      recipients,
      scheduledDate: moment().add(5, 's').format(),
      sender,
      subject,
      content,
      // Add processed data for webhook
      processedEmails,
      extractedData: processedEmails.map(e => ({
        email: e.email,
        company: e.companyName,
        date: date,
        time: time
      }))
    });
    
    console.log('✅ Email sent successfully with database tracking');
    
    res.json({ 
      success: true, 
      message: 'Email sent and data saved to database',
      processedEmails: processedEmails,
      totalProcessed: processedEmails.length
    });
  } catch (err) {
    console.error('❌ Error in email sending process:', err);
    res.json({ 
      success: false, 
      error: err.message,
      details: 'Check server console for detailed error information'
    });
  }
});

// Database API endpoints

// Get all emails with optional filtering
app.get('/api/emails', async (req, res) => {
  try {
    const { company, date_from, date_to } = req.query;
    
    const filters = {};
    if (company) filters.company_name = company;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    
    const emails = await getEmails(filters);
    
    res.json({
      success: true,
      emails: emails,
      total: emails.length,
      filters: filters
    });
  } catch (err) {
    console.error('❌ Error retrieving emails:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get email statistics and analytics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getEmailStats();
    
    res.json({
      success: true,
      statistics: stats,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error retrieving statistics:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Test company extraction endpoint
app.post('/api/test-extraction', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email address is required'
    });
  }
  
  try {
    const companyName = extractCompanyName(email);
    const { date, time } = formatDateTime();
    
    res.json({
      success: true,
      email: email,
      extracted_company: companyName,
      current_date: date,
      current_time: time
    });
  } catch (err) {
    console.error('❌ Error in extraction test:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Export database to Excel file
app.get('/api/export-excel', async (req, res) => {
  try {
    console.log('📊 Starting Excel export...');
    
    // Get all emails from database
    const emails = await getEmails();
    
    if (!emails || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No email data found in database to export'
      });
    }

    // Prepare data for Excel export
    const excelData = emails.map((email, index) => ({
      'No': index + 1,
      'Email': email.to_email,
      'Company Name': email.company_name || 'Unknown',
      'Subject': email.subject || 'No Subject',
      'Application Date': email.sent_date,
      'Application Time': email.sent_time,
      'Full DateTime': `${email.sent_date} ${email.sent_time}`,
      'Status': email.status || 'Sent'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 30 },  // Email
      { wch: 25 },  // Company Name
      { wch: 40 },  // Subject
      { wch: 15 },  // Application Date
      { wch: 15 },  // Application Time
      { wch: 20 },  // Full DateTime
      { wch: 10 }   // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Applications');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `Email_Applications_Export_${currentDate}.xlsx`;
    const filepath = path.join(__dirname, filename);

    // Write the Excel file
    XLSX.writeFile(workbook, filepath);

    console.log(`✅ Excel file created: ${filename}`);
    console.log(`📁 File location: ${filepath}`);
    console.log(`📊 Total records exported: ${emails.length}`);

    // Send file as download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('❌ Error sending Excel file:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to download Excel file'
        });
      } else {
        console.log(`✅ Excel file downloaded successfully: ${filename}`);
        
        // Optionally delete the file after download (uncomment if needed)
        // setTimeout(() => {
        //   fs.unlinkSync(filepath);
        //   console.log(`🗑️ Temporary file deleted: ${filename}`);
        // }, 30000); // Delete after 30 seconds
      }
    });

  } catch (err) {
    console.error('❌ Error creating Excel export:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      details: 'Failed to export database to Excel'
    });
  }
});

app.listen(PORT, () => {  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Database API endpoints available:`);
  console.log(`   GET  /api/emails - Retrieve email history`);
  console.log(`   GET  /api/stats  - Get email statistics`);
  console.log(`   POST /api/test-extraction - Test company extraction`);
  console.log(`   GET  /api/export-excel - Export database to Excel file`);
});
