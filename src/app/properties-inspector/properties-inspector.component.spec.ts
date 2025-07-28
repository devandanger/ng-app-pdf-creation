import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesInspectorComponent } from './properties-inspector.component';

describe('PropertiesInspectorComponent', () => {
  let component: PropertiesInspectorComponent;
  let fixture: ComponentFixture<PropertiesInspectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesInspectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
