import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/service.service';
import Swal from 'sweetalert2';
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
    usersId: '',
    isPublic: true,
    isLocationEnable : true
  };
  username: string = "";
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLInputElement>;
  constructor(private ServiceSrv: ServiceService,private toastr: ToastrService,private route:Router) {
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
        this.user.isPublic = res.isPublic;
        this.user.isLocationEnable = res.isLocationEnable;
        console.log(this.user);
        
        if (res.profilePicture == null) {
          this.user.profilePicture = 'assets/avatar.png';
        } else {
          this.user.profilePicture = res.profilePicture;
        }

      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  onSubmit() {
    console.log(this.user); 
    if(this.user.fullName.trim() == ""){this.toastr.error("Full Name is required");return}
    this.ServiceSrv.UpdateUserProfile(this.user, this.username).subscribe({
      next: (res: any) => {
        console.log(res);
        this.GetData();
        this.toastr.success("Profile Updated Successfully");
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error.errors.Bio[0]);
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
logout(){
Swal.fire({
  title: 'Sure you want to Logout?',
  html: '<p style="color: #999; margin-top: 10px; line-height: 1.6;">You will need to login again to access your account.</p>',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Logout',
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
    cancelButton: 'black-white-cancel-btn'
  }
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: 'Logging out...',
      text: 'See you soon!',
      icon: 'success',
      background: '#000000',
      color: '#ffffff',
      iconColor: '#ffffff',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      customClass: {
        popup: 'black-white-popup',
        timerProgressBar: 'black-white-timer'
      }
    });
    
    this.ServiceSrv.logout();
    localStorage.clear();
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
});
}
 
}
