@Service
public class EmployeeService {
  @ServiceName("EmployeeService")
  public class Handler {
    @On(entity = Employees_.CDS_NAME)
    public void calculateSalary(CdsReadEventContext context, CdsEntity<Employee> employee) {
      LocalDate hire = employee.getHireDate();
      int years = Period.between(hire, LocalDate.now()).getYears();
      BigDecimal base = employee.getRole().getBaseSalary();
      employee.setSalary(base.add(BigDecimal.valueOf(1000 * years)));
    },
    
    public void calculateSalary(CdsReadEventContext context, CdsEntity<Employee> employee) {
        LocalDate hire = employee.getHireDate();
        int years = Period.between(hire, LocalDate.now()).getYears();
        BigDecimal base = employee.getRole().getBaseSalary();
        employee.setSalary(base.add(BigDecimal.valueOf(1000 * years)));
      },
  }
}
