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
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                        <img src="https://regalamelo.edoardosarri.com/og-image.png" alt="Regalamelo Logo" style="max-width: 100%; height: auto; border-radius: 4px;" />
                    </div>
                    <div style="padding: 30px; color: #334155; line-height: 1.6;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Regalamelo Update</h2>
                        <p style="font-size: 16px;">Hello,</p>
                        <p style="font-size: 16px;">The gift <b>"${itemName}"</b> that you had claimed on the list <b>"${listName}"</b> has been removed by the celebrant.</p>
                        <p style="font-size: 16px;">You no longer need to buy it. You can check the list again for other available items.</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Regalamelo. All rights reserved.</p>
                    </div>
                </div>
            `
            : `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                        <img src="https://regalamelo.edoardosarri.com/og-image.png" alt="Regalamelo Logo" style="max-width: 100%; height: auto; border-radius: 4px;" />
                    </div>
                    <div style="padding: 30px; color: #334155; line-height: 1.6;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Aggiornamento Regalamelo</h2>
                        <p style="font-size: 16px;">Ciao,</p>
                        <p style="font-size: 16px;">Il regalo <b>"${itemName}"</b> che avevi prenotato sulla lista <b>"${listName}"</b> è stato rimosso dal festeggiato.</p>
                        <p style="font-size: 16px;">Non è più necessario acquistarlo. Puoi consultare nuovamente la lista per scoprire altri regali disponibili.</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Regalamelo. Tutti i diritti riservati.</p>
                    </div>
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
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                        <img src="https://regalamelo.edoardosarri.com/og-image.png" alt="Regalamelo Logo" style="max-width: 100%; height: auto; border-radius: 4px;" />
                    </div>
                    <div style="padding: 30px; color: #334155; line-height: 1.6;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Benvenuto in Regalamelo!</h2>
                        <p style="font-size: 16px;">Ciao,</p>
                        <p style="font-size: 16px;">Per attivare il tuo account e iniziare a creare le tue liste desideri, verifica il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${verifyUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Verifica la tua Email</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
                        <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin-top: 5px;">${verifyUrl}</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Regalamelo. Tutti i diritti riservati.</p>
                    </div>
                </div>
            `
            : `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                        <img src="https://regalamelo.edoardosarri.com/og-image.png" alt="Regalamelo Logo" style="max-width: 100%; height: auto; border-radius: 4px;" />
                    </div>
                    <div style="padding: 30px; color: #334155; line-height: 1.6;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Welcome to Regalamelo!</h2>
                        <p style="font-size: 16px;">Hi,</p>
                        <p style="font-size: 16px;">To activate your account and start creating your wish lists, please verify your email address by clicking the button below:</p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${verifyUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Verify your Email</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin-top: 5px;">${verifyUrl}</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Regalamelo. All rights reserved.</p>
                    </div>
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
