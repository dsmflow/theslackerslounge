import { signInWithPopup, GithubAuthProvider, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber as firebaseSignInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase.ts';
import { Auth } from 'firebase/auth';

export const signInWithGithub = () => signInWithPopup(auth, new GithubAuthProvider());
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signInWithPhoneNumber = (auth: Auth, phoneNumber: string) => {
  const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {});
  return firebaseSignInWithPhoneNumber(auth, phoneNumber, appVerifier); 
};
