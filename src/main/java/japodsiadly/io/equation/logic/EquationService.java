package japodsiadly.io.equation.logic;

import japodsiadly.io.equation.model.Equation;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log
public class EquationService {
    public String createEquation(Equation equation) {
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < equation.getEquation().length; i++) {
            if (equation.getEquation()[i] == 0) {
                continue;
            }
            if (equation.getEquation()[i] < 0) result.append("-");
            else result.append("+");

            String partialResult;
            if (i == equation.getEquation().length - 1)
                partialResult = "";
            else {
                partialResult = "x" + "*x".repeat(Math.max(0, equation.getEquation().length - 2 - i));
                partialResult = "*" + partialResult;
            }
            result.append(equation.getEquation()[i]).append(partialResult);
        }
        result.deleteCharAt(0);

        return result.toString();
    }
}
