declare var google: any;
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ServiceService } from './service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
    // Google OAuth initialization (if needed)
  }

  handleCredentialResponse(response: any) {
    const token = response.credential;
    const payload: any = this.ServiceSrv.decodeJwt(token);
    console.log(payload);

    this.user = {
      name: payload.FullName,
      email: payload.Email
    };

    this.Authform.email = this.user.email;
    if (this.user.email != null || this.user.email != undefined || this.user.email != "") {
      this.ServiceSrv.Auth(this.Authform).subscribe({
        next: (res: any) => {
          console.log(res);
          localStorage.setItem('jwt', res.token);
          this.toastr.success('You have been logged in successfully');
          this.isLoggedIn = true;
          this.router.navigateByUrl('/home');
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.error('Error occurred while logging in', err.error);
        }
      })
    }
  }

  signup() {
    this.loginform = !this.loginform;
    this.errorMessages = [];
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
          // Store only the access token
          localStorage.setItem('jwt', res.token);

          this.isLoggedIn = true;
          this.loginemail = "";
          this.loginpassword = "";
          this.isLoading = false;
          this.toastr.success('Logged in successfully');
              setTimeout(() => {
        window.location.reload()
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
    })

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
        // Store only the access token
        localStorage.setItem("jwt", res.token);

        this.isLoggedIn = true;

        // Clear fields
        this.signupemail = "";
        this.signuppassword = "";
        this.signupusername = "";
        this.signupname = "";
        this.errorMessages = [];

        this.isLoading = false;
          setTimeout(() => {
        window.location.reload()
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