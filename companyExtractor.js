// Free local company name extraction (no API needed)
export function extractCompanyName(email) {
    if (!email || !email.includes('@')) {
        return 'Unknown';
    }

    const domain = email.split('@')[1].toLowerCase();
    
    // Common email providers to filter out
    const commonProviders = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
        'icloud.com', 'aol.com', 'protonmail.com', 'tutanota.com',
        'yandex.com', 'mail.com', 'zoho.com', 'fastmail.com'
    ];

    // If it's a common provider, return "Personal Email"
    if (commonProviders.includes(domain)) {
        return 'Personal Email';
    }

    // Extract company name from domain
    let companyName = domain;

    // Remove common TLDs
    const tlds = ['.com', '.org', '.net', '.edu', '.gov', '.co.uk', '.fr', '.de', '.ca', '.au'];
    for (const tld of tlds) {
        if (companyName.endsWith(tld)) {
            companyName = companyName.replace(tld, '');
            break;
        }
    }

    // Remove 'www.' prefix if present
    if (companyName.startsWith('www.')) {
        companyName = companyName.replace('www.', '');
    }

    // Split by dots and take the main part
    const parts = companyName.split('.');
    if (parts.length > 1) {
        // Usually the main company name is the second-to-last part
        // e.g., careers.microsoft.com -> microsoft
        companyName = parts[parts.length - 2] || parts[0];
    }

    // Common company domain patterns
    const companyPatterns = {
        'hr-': '',
        'careers-': '',
        'jobs-': '',
        'recruitment-': '',
        'talent-': ''
    };

    // Remove common prefixes
    for (const [pattern, replacement] of Object.entries(companyPatterns)) {
        if (companyName.startsWith(pattern)) {
            companyName = companyName.replace(pattern, replacement);
        }
    }

    // Capitalize first letter and clean up
    companyName = companyName
        .replace(/[-_]/g, ' ')  // Replace dashes and underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();

    // If still empty or too short, use domain
    if (!companyName || companyName.length < 2) {
        companyName = domain.split('.')[0].toUpperCase();
    }

    return companyName || 'Unknown Company';
}

// Enhanced date formatting function
export function formatDateTime() {
    const now = new Date();
    
    // Format: DD/MM/YYYY
    const date = [
        String(now.getDate()).padStart(2, '0'),
        String(now.getMonth() + 1).padStart(2, '0'),
        now.getFullYear()
    ].join('/');
    
    // Format: HH:MM
    const time = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0')
    ].join(':');
    
    return { date, time };
}

// Test the extraction function with common examples
export function testCompanyExtraction() {
    const testEmails = [
        'hr@microsoft.com',
        'jobs@google.com',
        'careers@apple.com',
        'recruitment@amazon.com',
        'talent@facebook.com',
        'contact@startup.io',
        'info@consulting-firm.co.uk',
        'admin@techcorp.net',
        'someone@gmail.com',
        'user@yahoo.com'
    ];

    console.log('🧪 Testing Company Name Extraction:');
    console.log('=====================================');
    
    testEmails.forEach(email => {
        const company = extractCompanyName(email);
        console.log(`${email.padEnd(30)} → ${company}`);
    });
    
    console.log('=====================================');
}

export default { extractCompanyName, formatDateTime, testCompanyExtraction };
