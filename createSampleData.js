import { saveEmailData, initializeDatabase } from './database.js';
import { extractCompanyName, formatDateTime } from './companyExtractor.js';

// Initialize database
await initializeDatabase();

// Sample email addresses for testing
const testEmails = [
    'hr@microsoft.com',
    'jobs@google.com',
    'careers@apple.com',
    'recruitment@amazon.com',
    'contact@facebook.com',
    'info@spotify.com',
    'jobs@netflix.com',
    'hr@adobe.com',
    'careers@tesla.com',
    'contact@airbnb.com'
];

console.log('🧪 Creating sample database entries for Excel export testing...');

// Create sample data
for (const email of testEmails) {
    const companyName = extractCompanyName(email);
    const { date, time } = formatDateTime();
    
    const emailData = {
        to_email: email,
        company_name: companyName,
        subject: 'Candidature pour un stage en développement web full stack',
        body: 'Bonjour,\n\nJe me permets de vous contacter pour un stage...',
        sent_date: date,
        sent_time: time
    };
    
    try {
        const result = await saveEmailData(emailData);
        console.log(`✅ Sample data saved for ${companyName} (${email}) - ID: ${result.id}`);
    } catch (error) {
        console.error(`❌ Error saving data for ${email}:`, error);
    }
}

console.log('🎉 Sample data creation completed!');
console.log('You can now test the Excel export functionality.');

process.exit(0);
