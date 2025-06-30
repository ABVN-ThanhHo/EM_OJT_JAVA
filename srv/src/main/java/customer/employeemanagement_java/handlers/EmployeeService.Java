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

    @On(event = "me")
    public CdsData onMe(UserInfo userInfo) {
        String id = userInfo.getName();

        List<String> roles = userInfo.getRoles()
                                     .stream()
                                     .map(role -> role.getName())
                                     .collect(Collectors.toList());

        return CdsData.create()
                      .entry("id", id)
                      .entry("roles", roles);
    },

    @On(event = CdsService.EVENT_READ, entity = "EmployeeService.Departments")
    public void onRead(CdsReadEventContext context) {
        User user = context.getUser();
        System.out.println("Logged in user: " + user.getName());
        System.out.println("Roles: " + user.getRoles());
    }
    
  }
}
