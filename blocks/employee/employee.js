export default function decorate(block) {
    // Get all employee data from the existing div structure
    const employees = [];
    
    // Select all employee rows
    block.querySelectorAll('.employee > div').forEach((empDiv) => {
      const details = empDiv.querySelectorAll('p');
      if (details.length === 3) {
        employees.push({
          firstName: details[0].textContent.trim(),
          lastName: details[1].textContent.trim(),
          age: details[2].textContent.trim(),
        });
      }
    });
  
    // Clear the original content
    block.innerHTML = '';
  
    // Create a table structure
    const table = document.createElement('table');
    table.classList.add('employee-table');
  
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Age</th>
      </tr>
    `;
    table.appendChild(thead);
  
    // Create table body
    const tbody = document.createElement('tbody');
    employees.forEach(emp => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${emp.firstName}</td>
        <td>${emp.lastName}</td>
        <td>${emp.age}</td>
      `;
      tbody.appendChild(row);
    });
  
    table.appendChild(tbody);
    block.appendChild(table);
  }
  