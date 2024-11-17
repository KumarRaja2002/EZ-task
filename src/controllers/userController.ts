import * as bcrypt from 'bcrypt';
import { Context } from 'hono'; // Adjust the import based on your framework.
import { UserDataServiceProvider } from '../services/database/userDataServiceProvider';
import { ResponseHelper } from '../helpers/responseHelper'; // Adjust the path.
import { ResourceAlreadyExistsException } from '../exceptions/resourseAlreadyExistsException';
import { generateEncryptedURL,verifyEncryptedURL } from '../utils/encryptionUtils';
import nodemailer from 'nodemailer';
import validate from '../helpers/validationHelper';
import { SignInSchema } from '../validations/user/signIn';
import { UnauthorisedException } from '../exceptions/unauthorisedException';
import { INVALID_CREDENTIALS, USER_LOGIN } from '../constants/appMessages';
import { getUserAuthTokens } from '../helpers/appHelper';

const userDataServiceProvider = new UserDataServiceProvider();

export class UserController {
  private transporter = nodemailer.createTransport({
    service: 'gmail', // Example: Use your email provider.
    auth: {
      user:'saraswathi2747@gmail.com',
      pass:'ojwk emwb ycms tfaj' , // Your email password or app password.
    },
  });

  public async signUp(c: Context) {
    try {
      const reqData = await c.req.json();

      const existedUser = await userDataServiceProvider.findUserByEmail(reqData.email);
      if (existedUser) {
        throw new ResourceAlreadyExistsException('email', 'Email already exists.');
      }
      console.log(existedUser)
      const userData = await userDataServiceProvider.create(reqData);

      const encryptedURL = generateEncryptedURL({ email: userData.email });

      await this.sendVerificationEmail(userData.email, encryptedURL);

      const { password, ...userDataWithoutPassword } = userData;

      return ResponseHelper.sendSuccessResponse(
        c,
        200,
        'User registered successfully. Please verify your email.',
        userDataWithoutPassword
      );
    } catch (error: any) {
      throw error;
    }
  }

  private async sendVerificationEmail(email: string, verificationURL: string) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Click the link below to verify your email:</p>
             <a href="${verificationURL}">${verificationURL}</a>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  public async verifyEmail(c: Context) {
    try {
      const { token } = c.req.query();
      console.log(token)
      const verifiedData = verifyEncryptedURL(token);
      if (!verifiedData?.email) {
        throw new Error('Invalid or expired token.');
      }
      await userDataServiceProvider.updateEmailVerifiedStatus(verifiedData.email);

      return ResponseHelper.sendSuccessResponse(c, 200, 'Email verified successfully.');
    } catch (error: any) {
      throw new Error('Email verification failed.');
    }
  }

  public async signIn(c: Context) {
    try {
        const reqData = await c.req.json();

        const validatedData = await validate(SignInSchema, reqData);

        const userData = await userDataServiceProvider.findUserByEmail(validatedData.email);
        if (!userData) {
            throw new UnauthorisedException(INVALID_CREDENTIALS);
        }

        const matchPassword = await bcrypt.compare(
            validatedData.password,
            userData.password,
        );

        if (!matchPassword) {
            throw new UnauthorisedException(INVALID_CREDENTIALS);
        }

        const { token, refreshToken } = await getUserAuthTokens(userData);
        
        const { password, ...userDataWithoutPassword } = userData;

        let response = {
            user_details: userDataWithoutPassword,
            access_token: token,
            refresh_token: refreshToken
        };

        return ResponseHelper.sendSuccessResponse(c, 200, USER_LOGIN, response);

    }
    catch (error: any) {
        throw error;
    }

}
}
