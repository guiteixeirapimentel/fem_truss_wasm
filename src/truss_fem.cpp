#include "print.h"
#include "Matrix.hpp"

extern "C" void UseMatrix()
{
    print("hallo");
    MatrixD matrix1(1, 3, {0, 2, 0});
    MatrixD matrix2(1, 1, {1, 2, 3});

    MatrixD matrix3(matrix1 * matrix2);

    char buffer[255];

    buffer[0] = matrix3(0,0);
    buffer[1] = 0;

    print(buffer);
}