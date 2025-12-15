declare var google: any;
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ServiceService } from './service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Instagram';
  isLoggedIn = false;
  loginform = true;
  Authform: any = {};
  user: any = {};
  loginemail: string = "";
  loginpassword: string = "";
  loginFormData: any = {}
  signupemail: string = ""
  signuppassword: string = ""
  signupname: string = ""
  signupusername: string = ""
  signUpFormData: any = {}
  googleReady = false;
  errorMessages: string[] = [];
  token: string = "";
  isLoading: boolean = false;

  constructor(
    private ServiceSrv: ServiceService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.token = localStorage.getItem("jwt") ?? "";

    if (this.token != "") {
      if (this.ServiceSrv.isValidToken()) {
        this.isLoggedIn = true;
        console.log(this.ServiceSrv.getEmail());
      } else {
        this.isLoggedIn = false;
        localStorage.removeItem("jwt");
      }
    }
  }

  ngOnInit() {
    // Load Google Identity Services script
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    // Check if script already exists
    if (document.getElementById('google-signin-script')) {
      this.initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-signin-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGoogleSignIn();
    };
    document.head.appendChild(script);
  }

  initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '1063221874510-l25cg8e1e216fk6735r21v87806f7ent.apps.googleusercontent.com', // Replace with your actual Google Client ID
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button
      const buttonDiv = document.getElementById('googleBtn');
      if (buttonDiv) {
        google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%'
          }
        );
      }

      this.googleReady = true;
    }
  }

  handleCredentialResponse(response: any) {
    this.isLoading = true;
    const token = response.credential;
    
    // Decode JWT token to get user info
    const payload = this.parseJwt(token);
    console.log('Google User Info:', payload);

    this.user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub
    };

    // Send to backend for authentication
    this.Authform = {
      Email: this.user.email,
      FullName: this.user.name,
      GoogleId: this.user.googleId,
      ProfilePicture: this.user.picture
    };

    this.ServiceSrv.Auth(this.Authform).subscribe({
      next: (res: any) => {
        console.log('Backend response:', res);
        this.isLoading = false;
        setTimeout(() => {
          this.isLoggedIn = true;
          window.location.reload();
        }, 200);
      },
      error: (err: any) => {
        console.log('Error:', err);
        this.isLoading = false;
        Swal.fire({
          title: err.error,
          html: `<p style="color: #999; margin-top: 10px; line-height: 1.6;">No Account found with ${this.user.email}.</p>`,
          icon: 'error', 
          confirmButtonText: 'Close',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
          background: '#000000',
          color: '#ffffff',
          iconColor: '#ffffff',
          backdrop: 'rgba(0, 0, 0, 0.95)',
          confirmButtonColor: '#ffffff',
          cancelButtonColor: '#000000',
          customClass: {
            popup: 'black-white-popup',
            confirmButton: 'black-white-confirm-btn',
            cancelButton: 'black-white-casncel-btn'
          }
        }).then((result) => { 
        });
      }
    });
  }

  // Helper function to decode JWT
  parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
  }

  signup() {
    this.loginform = !this.loginform;
    this.errorMessages = [];
    
    // Re-render Google button when switching forms
    setTimeout(() => {
      if (this.googleReady) {
        const buttonDiv = document.getElementById('googleBtn');
        if (buttonDiv && typeof google !== 'undefined') {
          buttonDiv.innerHTML = ''; // Clear existing button
          google.accounts.id.renderButton(
            buttonDiv,
            {
              theme: 'filled_blue',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: '100%'
            }
          );
        }
      }
    }, 100);
  }

  // Login
  loginIn() {
    if (this.loginemail == "" || this.loginpassword == "") {
      this.toastr.error('Please fill all the fields');
      return;
    }

    this.isLoading = true;
    this.loginFormData.Email = this.loginemail;
    this.loginFormData.Password = this.loginpassword;

    this.ServiceSrv.login(this.loginFormData).subscribe({
      next: (res: any) => { 
        console.log(res);
        this.loginemail = "";
        this.loginpassword = "";
        this.isLoading = false;
        this.toastr.success('Logged in successfully');
        setTimeout(() => {
          this.isLoggedIn = true;
        }, 200);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
        this.toastr.error(
          'Error occurred while logging in',
          (err?.error?.errors?.Email?.[0]) ? err.error.errors.Email[0] : err?.error?.message
        );
      }
    });
  }

  SignUpInsta() {
    if (!this.signupemail || !this.signupname || !this.signuppassword || !this.signupusername) {
      this.toastr.error('Please fill all the fields');
      return;
    }

    const ReservedUsernames = [
      "login", "accounts", "search", "reels", "messages", "notifications", "map", "more",
      "explore", "stories", "story", "not-found", "home", "profile", "post", "p", "reel",
      "admin", "root", "system", "settings", "about", "help", "api", "v1", "static",
      "assets", "public", "private", "server", "auth", "config", "feed", "follow",
      "unfollow", "like", "comment"
    ];

    const username = this.signupusername.trim().toLowerCase();

    if (ReservedUsernames.includes(username)) {
      this.toastr.error("UserName already exists.");
      return;
    }

    this.isLoading = true;

    this.signUpFormData = {
      Email: this.signupemail,
      UserName: this.signupusername,
      Password: this.signuppassword,
      FullName: this.signupname
    };

    this.ServiceSrv.register(this.signUpFormData).subscribe({
      next: (res: any) => {
        this.toastr.success('You have been registered successfully');
        
        this.signupemail = "";
        this.signuppassword = "";
        this.signupusername = "";
        this.signupname = "";
        this.errorMessages = [];
        
        this.isLoading = false;
        setTimeout(() => {
          this.isLoggedIn = true;
        }, 200);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessages = [];

        if (error.status === 400 && error.error?.errors) {
          const validationErrors = error.error.errors;
          for (const field in validationErrors) {
            this.errorMessages.push(...validationErrors[field]);
          }
        }
        else if (error.error?.message) {
          this.errorMessages.push(error.error.message);
        }
        else {
          this.errorMessages.push('An unexpected error occurred.');
        }
      }
    });
  }
}