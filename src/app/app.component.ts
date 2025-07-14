declare var google: any;
import { AfterViewChecked, Component } from '@angular/core';
import { ServiceService } from './service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewChecked {
  title = 'Instagram';
  isLoggedIn = false;
  loginform = true;
  Authform: any = {};
  user: any = {};
  loginemail :string = "";
  loginpassword :string = "";
  constructor(private ServiceSrv: ServiceService, private toastr: ToastrService, private router: Router) {

  }
  ngAfterViewChecked(): void {

    google.accounts.id.initialize({
      client_id: '342524114261-p3vsv8huurr2psln2365dpjol1plnmdf.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
    });

    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large" }  // customize as needed
    );
  }
  handleCredentialResponse(response: any) {
    const token = response.credential;

    // Decode token or send it to backend
    const payload = this.ServiceSrv.decodeJwt(token);
    
    this.user = {
      name: payload.name,
      email: payload.email,
      photoUrl: payload.picture
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


}
