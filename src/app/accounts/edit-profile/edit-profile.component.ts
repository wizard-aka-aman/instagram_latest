import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  user = {
    profilePicture: '',
    fullName: '',
    userName: '',
    bio: '',
    // website: '',
    email: '',
    // phone: '',
    gender: '',
    usersId: ''
  };
  username: string = "";
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  constructor(private ServiceSrv: ServiceService,private toastr: ToastrService) {
    this.username = this.ServiceSrv.getUserName();
  }

  ngOnInit(): void {
    this.GetData();
  }
  GetData() {
    this.ServiceSrv.GetProfileByUserName(this.username).subscribe({
      next: (res: any) => {
        console.log(res);
        this.user.bio = res.bio;
        this.user.email = res.email;
        this.user.gender = res.gender;
        this.user.fullName = res.fullName;
        this.user.usersId = res.usersId
        this.user.userName = res.userName
        this.user.gender = res.gender;
        if (res.profilePicture == null) {
          this.user.profilePicture = 'assets/avatar.png';
        } else {
          this.user.profilePicture = "data:image/jpeg;base64,"+res.profilePicture;
        }

      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  onSubmit() {
    console.log(this.user); 
    this.ServiceSrv.UpdateUserProfile(this.user, this.username).subscribe({
      next: (res: any) => {
        console.log(res);
        this.GetData();
        this.toastr.success("Profile Updated Successfully");
      },
      error: (err) => {
        console.log(err);
      }
    })


  }



  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  close() {
    this.closeModal.nativeElement.click();
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const fData = new FormData();
      fData.append('filecollection', file); // must match parameter name in backend 
      console.log(fData);

      // TODO: Upload logic here (send to backend, etc.)
      this.ServiceSrv.UploadProfilePicture(this.username, fData).subscribe({
        next: (res: any) => {
          console.log(res);
          this.close();
          this.GetData();
        },
        error: (err) => {
          console.log(err);
          this.close();
        }
      })
    }
  }

  removePhoto() {
    this.ServiceSrv.RemoveProfilePicture(this.username).subscribe({
      next: (res: any) => {
        console.log(res);
        this.close();
        this.GetData();
      },
      error: (err) => {
        console.log(err);
        this.close();
      }
    })
  }

 
}
