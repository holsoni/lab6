import { Component } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import { v4 as uuidv4 } from 'uuid';
import {FormService} from "../service/form.service";
import {NotificationsService} from "../service/notifications.service";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  users:any[] = [];
  signedIn:any[] = [];
  checked:boolean = false;
  profile:any;
  profileExisting:boolean = false;
  wrongData:boolean = false;
  confirmedPasswordvalidation: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let password = control.get('password');
    let confirmedPassword = control.get('confirmedPassword');

    if(!this.profileExisting){
      return password && confirmedPassword && password.value != confirmedPassword.value ?
        { passwordNotConfirmed: true } : null;
    }
    else return null;
  };

  profileFbForm = this.fb.group(
    {id: undefined,
      firstName:['firstName', /*Validators.required*/],
      lastName:['lastname', /*Validators.required*/],
      type:['type'],
      email:['email', /*[Validators.required,Validators.email]*/],
      password:['password', /*[Validators.required, this.validatePassword()]*/],
      confirmedPassword:['password',/*Validators.required*/],
      subjects:this.fb.array([]),
      description:['description'],
      sex: ['sex'],
      phone: ['phone',/* Validators.pattern(/^\+380\d{9}$/)*/]
    },/*{ validators: this.confirmedPasswordvalidation }*/)




  constructor(private fb:FormBuilder, private service:FormService,private notifications:NotificationsService) {
  }
  ngOnInit(){
  }
  validatePassword() : ValidatorFn  {

    return (c: AbstractControl) => {
      if(c.value && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*.?%;_])[A-Za-z\d*.?%;_]{6,}$/.test(c.value)) {
        return null;
      } else {
        return {
          password: {
            valid: false
          }
        };
      }
    }}



  onSubmit() {
    this.addProfile();

    this.profile = this.profileFbForm.value;
    this.service.create(this.profile).subscribe(
      (response) => {
        this.notifications.showSuccessMessage('Створено успішно!');
      },
      (error) => {
        this.notifications.showErrorMessage('Помилка!');
      }
    );
    this.resetForm();

  }

  resetForm(){
    this.profileFbForm.reset();
    this.subjects.clear();
    this.checked = false;
    this.profileFbForm.get('confirmedPassword')?.setValidators(Validators.required);

  }

  get checkBoxValue(){
    return this.checked;
  }

  addProfile(){
    if(this.profileExisting){
      let newProfile = this.profileFbForm.value;
      newProfile.id = this.signedUserId;
      this.signedIn.push(this.profileFbForm.value)
    }
    else{
      let newProfile = this.profileFbForm.value;
      newProfile.id = uuidv4();
      console.log(newProfile);
      this.users.push(newProfile);
    }
  }
  get signedUserId():string{
    let name = this.profileFbForm.get('firstName')?.value;
    let lastName = this.profileFbForm.get('lastName')?.value;
    let profile = this.users.find(prof => prof.firstName.toLowerCase() === name?.toLowerCase()
      && prof.lastName.toLowerCase() === lastName?.toLowerCase());

    return profile.id;
  }
  get subjects(){
    return this.profileFbForm.get('subjects') as FormArray;
  }

  addSubject() {
    this.subjects.push(this.fb.control(""))
  }
  removeSubject(index: number) {
    this.subjects.removeAt(index);
  }

  removeAllSubjects(){
    this.subjects.clear();
  }

  onCheckboxChange(event:any){
    let sex = event.target.id;
    this.profileFbForm.controls['sex'].setValue(sex);

  }

  checkProfileExistence():boolean{
    if(this.users.length > 0) {
      let name = this.profileFbForm.get('firstName')?.value;
      let lastName = this.profileFbForm.get('lastName')?.value;
      let profile = this.users.find(prof => prof.firstName.toLowerCase() === name?.toLowerCase()
        && prof.lastName.toLowerCase() === lastName?.toLowerCase());


      if(profile != null){
        // console.log("checkProfileEx TRUE" );
        console.log(profile.id);
        this.profileExisting = true;
        this.profileFbForm.get('confirmedPassword')?.clearValidators();
        this.profileFbForm.get('confirmedPassword')?.updateValueAndValidity();

        return true;
      }
      else {
        //  console.log("checkProfileEx FALSE" );
        this.profileExisting = false;
      }

    }
    //  console.log(this.profileExisting);
    return false;
  }
}
