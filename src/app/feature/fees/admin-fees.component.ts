import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClassSectionService } from '../class-section/class-section.service';
import { ClassSectionOption } from '../../common/model/models';

interface PendingFee {
  studentName: string;
  className: string;
  section: string;
  amount: number;
  parentMobile: string;
}

@Component({
  selector: 'app-admin-fees',
  imports: [RouterLink],
  templateUrl: './admin-fees.component.html',
  styleUrl: './admin-fees.component.css'
})
export class AdminFeesComponent {
  private readonly classSectionService = inject(ClassSectionService);
  protected activeTab: 'structure' | 'pending' = 'structure';
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly selectedClass = signal('');
  protected readonly feeTypes = [
    { key: 'tuition', label: 'Tuition fee' },
    { key: 'transport', label: 'Transport fee' },
    { key: 'activities', label: 'Activities fee' },
    { key: 'examination', label: 'Examination fee' },
    { key: 'other', label: 'Other fee' }
  ];
  protected readonly feeAmounts = signal<Record<string, number>>({
    tuition: 5000,
    transport: 1200,
    activities: 500,
    examination: 300,
    other: 0
  });
  protected readonly monthlyTotal = computed(() =>
    Object.values(this.feeAmounts()).reduce((total, amount) => total + amount, 0)
  );
  protected readonly pendingFees = signal<PendingFee[]>([
    { studentName: 'Aarav Sharma', className: 'Class 8', section: 'A', amount: 7000, parentMobile: '+91 98765 43210' },
    { studentName: 'Meera Patel', className: 'Class 8', section: 'B', amount: 5200, parentMobile: '+91 98765 43211' },
    { studentName: 'Kabir Singh', className: 'Class 9', section: 'A', amount: 6500, parentMobile: '+91 98765 43212' }
  ]);
  protected statusMessage = '';

  constructor() {
    this.classSectionService.getAll().subscribe(options => {
      this.classOptions.set(options);
      this.selectedClass.set(options[0]?.classId ?? '');
    });
  }

  protected selectClass(event: Event): void {
    this.selectedClass.set((event.target as HTMLSelectElement).value);
    this.statusMessage = '';
  }

  protected selectTab(tab: 'structure' | 'pending'): void {
    this.activeTab = tab;
    this.statusMessage = '';
  }

  protected updateFee(key: string, event: Event): void {
    const amount = Number((event.target as HTMLInputElement).value);
    this.feeAmounts.update(current => ({ ...current, [key]: Number.isFinite(amount) && amount >= 0 ? amount : 0 }));
    this.statusMessage = '';
  }

  protected saveClassFees(): void {
    this.statusMessage = `${this.selectedClass()} monthly fee of ${this.formatCurrency(this.monthlyTotal())} is ready to be saved.`;
  }

  protected notifyParent(student: PendingFee): void {
    this.statusMessage = `WhatsApp communication for ${student.studentName} is ready to be connected to the API.`;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }
}
