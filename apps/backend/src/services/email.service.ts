import nodemailer from 'nodemailer';

export const sendClaimedItemRemovalNotification = async (
    guestEmail: string,
    itemName: string,
    listName: string,
    language: string = 'it'
): Promise<void> => {
    try {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

        if (!SMTP_HOST || SMTP_HOST === 'localhost' || SMTP_HOST === 'mock') {
            console.log(`[Email Mock] Email skipped for ${guestEmail}. SMTP_HOST is not configured with a real server.`);
            console.log(`Testo previsto:\nIl regalo "${itemName}" che avevi prenotato sulla lista "${listName}" è stato rimosso dal festeggiato.`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const subject = language === 'en'
            ? `Update regarding the gift "${itemName}"`
            : `Aggiornamento riguardo al regalo "${itemName}"`;

        const text = language === 'en'
            ? `Hello,\n\nThe gift "${itemName}" that you had claimed on the list "${listName}" has been removed by the celebrant. You no longer need to buy it.\n\nThank you,\nRegalamelo`
            : `Ciao,\n\nIl regalo "${itemName}" che avevi prenotato sulla lista "${listName}" è stato rimosso dal festeggiato. Non è più necessario acquistarlo.\n\nGrazie,\nRegalamelo`;

        const html = language === 'en'
            ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #007AFF;">Regalamelo Update</h2>
                    <p>Hello,</p>
                    <p>The gift <b>"${itemName}"</b> that you had claimed on the list <b>"${listName}"</b> has been removed by the celebrant.</p>
                    <p>You no longer need to buy it. You can check the list again for other available items.</p>
                    <br/>
                    <p>Thank you,</p>
                    <p><strong>Regalamelo</strong></p>
                </div>
            `
            : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #007AFF;">Aggiornamento Regalamelo</h2>
                    <p>Ciao,</p>
                    <p>Il regalo <b>"${itemName}"</b> che avevi prenotato sulla lista <b>"${listName}"</b> è stato rimosso dal festeggiato.</p>
                    <p>Non è più necessario acquistarlo. Puoi consultare nuovamente la lista per scoprire altri regali disponibili.</p>
                    <br/>
                    <p>Grazie,</p>
                    <p><strong>Regalamelo</strong></p>
                </div>
            `;

        await transporter.sendMail({
            from: `"Regalamelo" <${SMTP_USER}>`,
            to: guestEmail,
            subject,
            text,
            html,
        });

        console.log(`[Email Server] Notification sent successfully to: ${guestEmail}`);
    } catch (error) {
        console.error(`[Email Server] Failed to send email to ${guestEmail}:`, error);
    }
};

export const sendVerificationEmail = async (
    email: string,
    token: string,
    language: string = 'en'
): Promise<void> => {
    try {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FRONTEND_URL } = process.env;
        
        // This is safe fallback if FRONTEND_URL is missing
        const baseUrl = FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        if (!SMTP_HOST || SMTP_HOST === 'localhost' || SMTP_HOST === 'mock') {
            console.log(`[Email Mock] Verification email skipped for ${email}. SMTP_HOST is not configured with a real server.`);
            console.log(`Testo previsto:\nVerify URL: ${verifyUrl}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const subject = language === 'it' 
            ? 'Verifica il tuo account Regalamelo' 
            : 'Verify your Regalamelo account';

        const text = language === 'it'
            ? `Ciao,\n\nBenvenuto in Regalamelo! Per attivare il tuo account e iniziare a creare liste desideri, clicca sul link seguente:\n\n${verifyUrl}\n\nGrazie!`
            : `Hi,\n\nWelcome to Regalamelo! To activate your account and start creating your wish lists, please verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThank you!`;

        const html = language === 'it'
            ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #007AFF;">Benvenuto in Regalamelo</h2>
                    <p>Ciao,</p>
                    <p>Per attivare il tuo account e iniziare a creare liste desideri, verifica il tuo indirizzo email cliccando sul link qui sotto:</p>
                    <div style="margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verifica Email</a>
                    </div>
                    <p style="color: #666; font-size: 12px;">Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br/>${verifyUrl}</p>
                    <br/>
                    <p>Grazie,</p>
                    <p><strong>Regalamelo</strong></p>
                </div>
            `
            : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #007AFF;">Welcome to Regalamelo</h2>
                    <p>Hi,</p>
                    <p>To activate your account and start creating your wish lists, please verify your email address by clicking the link below:</p>
                    <div style="margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                    </div>
                    <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br/>${verifyUrl}</p>
                    <br/>
                    <p>Thank you,</p>
                    <p><strong>Regalamelo</strong></p>
                </div>
            `;

        await transporter.sendMail({
            from: `"Regalamelo" <${SMTP_USER}>`,
            to: email,
            subject,
            text,
            html,
        });

        console.log(`[Email Server] Verification email sent successfully to: ${email}`);
    } catch (error) {
        console.error(`[Email Server] Failed to send verification email to ${email}:`, error);
    }
};
