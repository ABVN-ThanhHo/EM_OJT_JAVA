package my.company.handlers;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.*;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.ql.Select;
import com.sap.cds.services.request.UserInfo;
import com.sap.cds.Row;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import cds.gen.employeeservice.*;

@Component
@ServiceName(EmployeeService_.CDS_NAME)
public class EmployeesServiceHandler implements EventHandler {

    private final PersistenceService db;
    private final UserInfo userInfo;

    private static final Logger logger = LoggerFactory.getLogger(EmployeesServiceHandler.class);

    public EmployeesServiceHandler(PersistenceService db, UserInfo userInfo) {
        this.db = db;
        this.userInfo = userInfo;
    }

    @On(event = "calculateSalary")
    public void calculateSalary(CalculateSalaryContext context) {
        // Get employee ID from context
        String empID = context.getEmpID();
        if (empID == null || empID.isEmpty()) {
            throw new IllegalArgumentException("Employee ID must not be null or empty.");
        }

        // Fetch employee's hireDate and role_ID using string paths
        Select employeeQuery = Select.from("my.company.Employees")
                .columns("hireDate", "role_ID")
                .byId(empID);

        Row employee = db.run(employeeQuery).single();
        if (employee == null) {
            throw new RuntimeException("Employee not found with ID: " + empID);
        }

        LocalDate hireDate;
        Object hireDateRaw = employee.get("hireDate");
        if (hireDateRaw instanceof java.sql.Date) {
            hireDate = ((java.sql.Date) hireDateRaw).toLocalDate();
        } else if (hireDateRaw instanceof LocalDate) {
            hireDate = (LocalDate) hireDateRaw;
        } else {
            throw new RuntimeException("Unexpected hireDate format for employee: " + empID);
        }

        String roleId = (String) employee.get("role_ID");

        // Calculate years of service
        int yearsOfService = Period.between(hireDate, LocalDate.now()).getYears();

        // Fetch baseSalary from Roles
        Select roleQuery = Select.from("my.company.Roles")
                .columns("baseSalary")
                .byId(roleId);

        Row role = db.run(roleQuery).single();
        if (role == null) {
            throw new RuntimeException("Role not found with ID: " + roleId);
        }

        BigDecimal baseSalary = (BigDecimal) role.get("baseSalary");

        // Calculate bonus: $1,000 per year of service
        BigDecimal bonus = BigDecimal.valueOf(1000L).multiply(BigDecimal.valueOf(yearsOfService));

        BigDecimal totalSalary = baseSalary.add(bonus);

        // Set result
        context.setResult(totalSalary);

        logger.info("Salary calculation completed for employee ID " + empID +
                " | Base: " + baseSalary +
                " | Bonus: " + bonus +
                " | Total: " + totalSalary);
    }

    @On(event = "me")
    public void me(MeContext context) {
        String userId = userInfo.getName();
        Collection<String> roles = userInfo.getRoles();
        String role = "anonymous";

        if (roles != null) {
            for (String roleItem : roles) {
                if ("Admin".equals(roleItem) || "Viewer".equals(roleItem)) {
                    role = roleItem;
                    break;
                }

            }
        }

        Map<String, Object> userInfoMap = new HashMap<>();
        userInfoMap.put(cds.gen.my.company.UserInfo.ID, userId != null ? userId : "unknown");
        userInfoMap.put(cds.gen.my.company.UserInfo.ROLES, role);

        cds.gen.my.company.UserInfo user = cds.gen.my.company.UserInfo.of(userInfoMap);
        context.setResult(user);
    }
}
