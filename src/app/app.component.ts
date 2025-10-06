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
  loginemail :string = "";
  loginpassword :string = "";
  loginFormData : any ={}
  signupemail : string = ""
  signuppassword : string = ""
  signupname : string = ""
  signupusername : string = ""
  signUpFormData : any ={}
  googleReady = false;
  errorMessages: string[] = [];
  token : string = "";
  isLoading: boolean = false;
  constructor(private ServiceSrv: ServiceService, private toastr: ToastrService, private router: Router) {
    this.token = localStorage.getItem("jwt") ?? "" ;
    // console.log(this.token); 
    if(this.token !=""){
      if(this.ServiceSrv.isValidToken()){
        this.isLoggedIn = true;
        console.log(this.ServiceSrv.getEmail());
        
      }
      else{
        this.isLoggedIn = false;
      }
    }
   
  } 

  ngOnInit() { 
  //  const checkGoogle = setInterval(() => {
  //     if (typeof google !== 'undefined') {
  //       console.log("✅ Google is ready ngoninit");
  //       this.googleReady = true;
  //          google.accounts.id.initialize({
  //     client_id: '342524114261-p3vsv8huurr2psln2365dpjol1plnmdf.apps.googleusercontent.com',
  //     // callback: this.handleCredentialResponse.bind(this),
  //   });
  //   google.accounts.id.renderButton(
  //     document.getElementById("googleBtn"),
  //     { theme: "outline", size: "large" }  // customize as needed
  //   );

  //       // Now safely use google.accounts.id.initialize()
  //       clearInterval(checkGoogle);
  //     }
  //   }, 500);
  } 


  handleCredentialResponse(response: any) {
    const token = response.credential;

    // Decode token or send it to backend
    const payload:any = this.ServiceSrv.decodeJwt(token);
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
    if (this.loginform) {
      this.loginform = false
    }
    else {
      this.loginform = true
    }
  }

  //login
  loginIn() {
    if(this.loginemail == "" || this.loginpassword == ""){
    this.toastr.error('Please fill all the fields');
    return;
  }
  this.isLoading = true;
    this.loginFormData.Email = this.loginemail;
    this.loginFormData.Password = this.loginpassword;
    this.ServiceSrv.Authlogin(this.loginFormData).subscribe({
      next: (res: any) => {
        console.log(res);
        localStorage.setItem('jwt', res.token);
        // this.toastr.success('You have been logged in successfully');  
        this.isLoggedIn = true;
        this.loginemail = "";
        this.loginpassword = "";
        this.isLoading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
        this.toastr.error('Error occurred while logging in', (err?.error?.errors?.Email[0])?err?.error?.errors?.Email[0]:err?.error?.message);
      }
    })
  }
  SignUpInsta(){
  if(this.signupemail == "" || this.signupname == "" || this.signuppassword == "" ||this.signupusername == "" ){
    this.toastr.error('Please fill all the fields');
    return;
  }
  this.isLoading = true;
    this.signUpFormData.Email = this.signupemail;
    this.signUpFormData.UserName = this.signupusername;
    this.signUpFormData.Password = this.signuppassword;
    this.signUpFormData.FullName = this.signupname;

    this.ServiceSrv.Authsignup(this.signUpFormData).subscribe({
      next: (res: any) => {
        console.log(res);
        this.toastr.success('You have been Register in successfully',res.message);
        localStorage.setItem("jwt" , res.token);
        this.isLoggedIn = true;
        this.signupemail = "";
        this.signuppassword = "";
        this.signupusername = "";
        this.signupname = "";
        this.isLoading = false;

      },
      error: (error: any) => {
        this.isLoading = false;
        console.log(error);
       if (error.status === 400 && error.error && error.error.errors) {
      const validationErrors = error.error.errors;
      this.errorMessages = [];

      for (const field in validationErrors) {
        if (validationErrors.hasOwnProperty(field)) {
          this.errorMessages.push(...validationErrors[field]);
        }
      }
    }else if(error.message){
      this.errorMessages = [];
      this.errorMessages.push(error.error.message);
    } 
    else {
      this.errorMessages = [];
      this.errorMessages = ['An unexpected error occurred.'];
    }
      }
    })
  }


}
