import { Component, inject } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  dashboard_users: Observable<any[]> | any;
  firestore: Firestore = inject(Firestore);

  loginForm: FormGroup | any;
  username: FormControl | any;
  password: FormControl | any;

  subscription: Subscription = new Subscription()

  logging: boolean = false

  users: any
  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.getDashboardUsers()
  }

  ngOnInit(): void {
    this.initForm();
  }

  getDashboardUsers() {
    const itemCollection = collection(this.firestore, 'dashboard_users');
    this.dashboard_users = collectionData(itemCollection);
    this.dashboard_users.subscribe((res: any) => {
      this.users = res
    })
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(32)]),
    })
  }

  get LoginFormControls() {
    return this.loginForm.controls
  }

  login() {

    if (this.loginForm.valid) {
      let userData: any = ''

      if (this.users?.length) {
        this.users?.forEach((user: any) => {
          if (user?.Email == this.loginForm.controls.email.value && user?.Password == this.loginForm.controls.password.value) {

            userData = { Email: user?.Email, access: user?.access };

            localStorage.setItem('userData', JSON.stringify(userData))

            Swal.fire({
              title: 'Login',
              text: 'User Login Successfully!',
              icon: 'success'
            }).then(() => {
              this.router.navigate(['/groups'])
            })
          } else {
            Swal.fire({
              title: 'Login',
              text: 'E-mail Or Password Is Wrong',
              icon: 'error'
            })
          }
        });
      } else {
        Swal.fire({
          title: 'Login',
          text: 'No users found in the system',
          icon: 'error'
        })
      }
    } else {
      Swal.fire({
        title: 'Login',
        text: 'E-mail Or Password Is Wrong',
        icon: 'error'
      })
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
