import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter
    constructor(){
        this.transporter = createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: 'mailingprueba61@gmail.com',
                pass: 'bgrroqifncmvzxzk',
            },
        })
    }

    async sendMail(to: string, subject: string, children: string, username: string, ): Promise<boolean> {
        const mailOptions ={
            from: 'PlayerOneSuport@gmail.com',
            to,
            subject,
            html: `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Restablece tu contraseña - PlayerOne</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');
                        body {
                            font-family: 'Montserrat', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 30px auto;
                            padding: 0;
                            background-color: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #28a745, #007bff);
                            padding: 25px;
                            text-align: center;
                            color: #ffffff;
                            border-radius: 8px 8px 0 0;
                        }
                        .header h1 {
                            font-size: 24px;
                            margin: 0;
                        }
                        .header .player {
                            color: #28a745;
                            font-weight: 600;
                        }
                        .header .one {
                            font-weight: 600;
                            color: #007bff;
                        }
                        .message {
                            padding: 20px;
                            line-height: 1.6;
                            color: #555555;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 20px;
                            margin: 20px 0;
                            background-color: #ff9800;
                            color: #ffffff;
                            text-decoration: none;
                            font-weight: 600;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            font-size: 12px;
                            color: #777777;
                            background-color: #fafafa;
                            border-top: 1px solid #eeeeee;
                            border-radius: 0 0 8px 8px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 class="player">Player<span class="one">One</span></h1>
                        </div>
                        <div class="message">
                            <p><strong>¡Hola ${username}!</strong></p>
                            ${children}
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} PlayerOne - Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
            </html>`
        }
        try {
            const response = await this.transporter.sendMail(mailOptions);
            console.log(response);
            
            return true
        } catch (error) {
            throw new Error(error)
        }
    }
}
