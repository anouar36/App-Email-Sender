import sendEmail from "./mailSender.js";
import moment from "moment";

let emailList = [
  "itsolutions@intelcia.com",
  "contact@radiumdigital.ma",
  "contact@digitalandcreativity.com",
  "contact@digitalholding.ma",
  "contact@digitalclub.ma",
  "Contact@digitalma.ma",
  "contact@digitalad.ma",
  "contact@up-skill.org",
  "contact@pixelweb.ma",
  "contact@softas.ma",
  "contact@apexagency.ma",
  "contact@softydev.com",
  "contact@infomed-tech.com",
  "simo.asmouh@gmail.com",
  "mazouari@powerm.ma",
  "contact@creation-site-maroc.ma",
  "contact@inovteam.com",
  "contact@highsystemsinfo.com",
  "Contact@jokesigner.com",
  "khadija.marine@sofrecom.com",
  "webagency.maroc.group@gmail.com",
  "cbi@cbi.ma",
  "talentunit.ma@capgemini.com",
  "Imane.machane@hps-worldwide.com",
  "Contact@adria-bt.com",
  "contact@finatech.com",
  "cv@dba.ma",
  "hello@dba.ma",
  "contact@cbo.ma",
  "anwar.class36flow@gmail.com",
  "ayoub.labite@gmail.com"
];

const sendEmails = async () => {
  try {
    await sendEmail({
      recipients: emailList,
      recipients: emailList,
      scheduledDate: moment().add(5, "s").format(),
      sender: "Ayoub labite",
      subject: "Candidature pour un stage en développement web full stack",
      content:"Bonjour,\n\n Je me permets de vous adresser ma candidature pour un stage en développement web full stack d'une durée de deux mois, à partir de mai 2025. Actuellement étudiant à YouCode UM6P Maroc, je suis motivé à mettre mes compétences techniques et mes connaissances au service de vos projets.Au cours de ma formation et de mes projets académiques réalisés au sein de YouCode, j’ai pu développer des compétences solides en développement web, aussi bien en front-end qu’en back-end. J’ai également acquis des compétences transversales telles que le travail en équipe, la gestion de projet agile et la résolution de problèmes techniques. Vous trouverez ci-joint mon CV pour plus de détails sur mon parcours. Je serais ravi d’échanger avec vous lors d’un entretien afin de discuter de la manière dont je pourrais contribuer à vos projets. Je reste à votre disposition pour toute information complémentaire. Vous pouvez me joindre au +212 622-734781 ou par email à ayoub.labite@gmail.com. Dans l’attente de votre retour, je vous prie d’agréer l’expression de mes salutations respectueuses.\n Cordialement, \nAyoub Labit"
      // content: "Bonjour,  \n\n J'espère que vous allez bien, Je me permets de vous contacter afin de vous présenter ma candidature pour un stage au sein de votre entreprise. Actuellement étudiant en développement Full Stack à YouCode (UM6P), j’ai acquis des compétences solides dans plusieurs technologies, notamment (JavaScript, PHP, Laravel, Symfony). Je serais ravi de vous faire parvenir mon CV pour vous donner plus de détails sur mon parcours et mes compétences. Je reste à votre disposition pour toute information complémentaire et un éventuel entretien.\n\nCordialement, \nAnouar Ech Charai,", 
    });

    console.log("✅ Emails have been scheduled successfully!");
  } catch (err) {
    console.error("❌ Error sending emails:", err);
  }
};

sendEmails();
