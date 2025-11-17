import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import moment from 'moment';
import sendEmail from './mailSender.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/api/send', async (req, res) => {
  const { senderName, sender, password, subject, content, recipients } = req.body;
  try {
    await sendEmail({
      recipients,
      scheduledDate: moment().add(5, 's').format(),
      senderName,
      sender, // optional, will use .env if not provided
      password, // optional, will use .env if not provided
      subject,
      content
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
