import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RxoneComponent } from './rxone/rxone.component';

const routes: Routes = [
    {path: 'rx', component: RxoneComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}


const router: Routes[] = [

];
@NgModule({
    declarations: [
        RxoneComponent,
    ],
    imports: [
        RouterModule.forRoot(
            routes
        ),
    ],
    exports: [RouterModule, RxoneComponent],
})
export class routeModule {}
