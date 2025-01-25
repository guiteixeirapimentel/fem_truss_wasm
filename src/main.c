#include "print.h"
#include "truss_fem.hpp"

#ifndef WASM
#include <stdio.h>
#include <math.h>
#include <fenv.h>
#endif

void ProblemaExemplo()
{
    const int node_1 = AddNode(0, 0, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_2 = AddNode(0, 1.5, kBcForce, 0, kBcForce, 0); // Assumindo ponto x!
    const int node_3 = AddNode(2, 0, kBcForce, 0, kBcForce, -8750);
    const int node_4 = AddNode(2, 2, kBcForce, 0, kBcForce, 0);
    const int node_5 = AddNode(3.5, 0, kBcForce, 0, kBcForce, -7500);
    const int node_6 = AddNode(3.5, 2.5, kBcForce, 0, kBcForce, 0);
    const int node_7 = AddNode(5.0, 0, kBcForce, 0, kBcForce, -7500);
    const int node_8 = AddNode(5.0, 2.5, kBcForce, 0, kBcForce, 0);
    const int node_9 = AddNode(6.5, 2.5, kBcForce, 0, kBcForce, 0);
    const int node_10 = AddNode(6.5, 0, kBcForce, 0, kBcForce, -7500);
    const int node_11 = AddNode(8.0, 2, kBcForce, 0, kBcForce, 0);
    const int node_12 = AddNode(8.0, 0, kBcForce, 0, kBcForce, -8750);
    const int node_13 = AddNode(10, 1.5, kBcForce, 0, kBcForce, 0); // Assumindo ponto x!
    const int node_14 = AddNode(10, 0, kBcDisplacement, 0, kBcForce, 0);

    const double E = 210e9;
    const double A1 = 146e-6;
    const double A2 = 284e-6;

    const int element_1 = AddElement(node_1, node_2, E, A1);
    const int element_3 = AddElement(node_2, node_4, E, A1);
    const int element_4 = AddElement(node_4, node_6, E, A1);
    const int element_5 = AddElement(node_6, node_8, E, A1);
    const int element_6 = AddElement(node_8, node_9, E, A1);
    const int element_7 = AddElement(node_9, node_11, E, A1);
    const int element_8 = AddElement(node_11, node_13, E, A1);
    const int element_9 = AddElement(node_13, node_14, E, A1);
    const int element_10 = AddElement(node_12, node_14, E, A2);
    const int element_11 = AddElement(node_1, node_3, E, A2);
    const int element_12 = AddElement(node_3, node_5, E, A1);
    const int element_13 = AddElement(node_5, node_7, E, A1);
    const int element_14 = AddElement(node_7, node_10, E, A1);
    const int element_15 = AddElement(node_10, node_12, E, A1);
    const int element_16 = AddElement(node_7, node_8, E, A2);
    const int element_17 = AddElement(node_6, node_7, E, A2);
    const int element_18 = AddElement(node_7, node_9, E, A2);
    const int element_19 = AddElement(node_5, node_6, E, A2);
    const int element_20 = AddElement(node_9, node_10, E, A2);
    const int element_21 = AddElement(node_4, node_5, E, A2);
    const int element_22 = AddElement(node_3, node_4, E, A2);
    const int element_23 = AddElement(node_10, node_11, E, A2);
    const int element_24 = AddElement(node_12, node_11, E, A2);
    const int element_25 = AddElement(node_2, node_3, E, A1);
    const int element_26 = AddElement(node_12, node_13, E, A1);

    Solve();
}

void SimpleAxial()
{
    const int node_1 = AddNode(0, 0, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_2 = AddNode(1.0, 0.0, kBcForce, 1.0, kBcDisplacement, 0.0);
    const int elem_1 = AddElement(node_1, node_2, 1, 1);

    Solve();
}

void SimpleAxial2()
{
    const int node_1 = AddNode(0, 0, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_2 = AddNode(0.0, 1.0, kBcDisplacement, 0.0, kBcForce, 1.0);
    const int elem_1 = AddElement(node_1, node_2, 1, 1);

    Solve();
}

void Ex320()
{
    /*

        /_\
    */

    const double L = 100;
    const double E = 1e6;
    const double A = 5;

    const int node_1 = AddNode(0, 0, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_2 = AddNode(L, L * tan(3.14159 * 45.0 / 180.0), kBcDisplacement, 0, kBcForce, 10000);
    const int node_3 = AddNode(2 * L, 0.0, kBcDisplacement, 0, kBcDisplacement, 0.0);

    const int elem_1 = AddElement(node_1, node_2, E, A);
    const int elem_2 = AddElement(node_3, node_2, E, A);
    Solve();
}

void Ex323()
{
    /*

        /_\
    */

    const double L = 100;
    const double E = 10e6;
    const double A = 1;

    const int node_1 = AddNode(L / 2, L / 2 * tan(3.14159 * 60.0 / 180.0), kBcForce, 12000, kBcDisplacement, 0);
    const int node_2 = AddNode(0, 0, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_3 = AddNode(L, 0.0, kBcDisplacement, 0, kBcDisplacement, 0.0);

    const int elem_1 = AddElement(node_2, node_1, E, A);
    const int elem_2 = AddElement(node_1, node_3, E, A);
    Solve();
}

void Example35()
{
    const int node_1 = AddNode(0, 0, kBcForce, 0, kBcForce, -10000);
    const int node_2 = AddNode(0, 120, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_3 = AddNode(120, 120, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_4 = AddNode(120, 0, kBcDisplacement, 0, kBcDisplacement, 0);

    const double E = 30e6;
    const double A = 2;

    const int element_1 = AddElement(node_2, node_1, E, A);
    const int element_2 = AddElement(node_3, node_1, E, A);
    const int element_3 = AddElement(node_1, node_4, E, A);

    Solve();
}

void BasicTriangle()
{
    /*
    /\
    */

    const double E = 1;
    const double A = 1;

    const int node_1 = AddNode(0, 0, kBcDisplacement, 0, kBcDisplacement, 0);
    const int node_2 = AddNode(1, 1, kBcForce, 0, kBcForce, 1);
    const int node_3 = AddNode(2, 0, kBcForce, 0, kBcDisplacement, 0.0);

    const int elem_1 = AddElement(node_1, node_2, E, A);
    const int elem_2 = AddElement(node_2, node_3, E, A);
    Solve();
}

int main()
{
#ifndef WASM
    feenableexcept(FE_INVALID |
        FE_DIVBYZERO |
        FE_OVERFLOW |
        FE_UNDERFLOW);
#endif
    // UseMatrix();
    // SimpleAxial();
    // SimpleAxial2();
    // Ex320();
    BasicTriangle();
    // Ex323();
    // Example35();

    return 0;
}
