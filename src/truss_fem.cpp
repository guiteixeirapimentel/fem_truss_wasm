#include "print.h"
#include "Matrix.hpp"
#include "MatrixUtils.hpp"
#include "truss_fem.hpp"
#include "vector.hpp"

#ifndef WASM
#include <string>
#include <fstream>
#endif

const int kBcForce = 0;
const int kBcDisplacement = 1;
const int kInvalidId = -1;

static constexpr double kPI = 3.14159265358979323846;

struct Vector2D
{
    double x;
    double y;

    Vector2D operator-(const Vector2D& rhs) const
    {
        return Vector2D{ .x = x - rhs.x, .y = y - rhs.y };
    }

    double length() const
    {
        return sqrt((x * x) + (y * y));
    }

    double dotWith(const Vector2D& other) const
    {
        return (x * other.x) + (y * other.y);
    }

    double angleBetween(const Vector2D& other) const
    {
        return atan2(x * other.y - y * other.x, dotWith(other));
    }
};

// TODO: Arbitrary directions for BCs.
enum class BCType
{
    DISPLACEMENT,
    FORCE,
};

struct BoundaryCondition
{
    BCType type;
    double value;
};

struct Node
{
    Vector2D pos;
    BoundaryCondition bc_x;
    BoundaryCondition bc_y;
};

struct Element
{
    std::size_t node_id_i;
    std::size_t node_id_f;
    double young_modulus;
    double area;
};

MatrixD GetTrussElementStiffnes(const Vector<Node>& nodes, const Element& element)
{
    const auto node_i = nodes[element.node_id_i];
    const auto node_f = nodes[element.node_id_f];

    const auto theta = Vector2D{ 1.0, 0.0 }.angleBetween(node_f.pos - node_i.pos);

    const auto C = cos(theta);
    const auto S = sin(theta);

    const auto CC = C * C;
    const auto SS = S * S;
    const auto CS = C * S;

    MatrixD res{ 4, 4, {
        CC, CS, -CC, -CS,
        CS, SS, -CS, -SS,
        -CC, -CS, CC, CS,
        -CS, -SS, CS, SS
    } };

    const auto length = (node_f.pos - node_i.pos).length();
    res *= element.young_modulus * element.area / length;
    return res;
}

Vector<Node> nodes;
Vector<Element> elements;
MatrixD displacements;
MatrixD forces;

extern "C" void UseMatrix()
{
    // static constexpr auto kNNodes = 4;

    nodes.PushBack({ .pos = {0.0, 0.0},
                    .bc_x = {.type = BCType::FORCE, .value = 0},
                    .bc_y = {.type = BCType::FORCE, .value = -10'000} });
    nodes.PushBack({ .pos = {0.0, 10.0 * 12},
                    .bc_x = {.type = BCType::DISPLACEMENT, .value = 0},
                    .bc_y = {.type = BCType::DISPLACEMENT, .value = 0} });
    nodes.PushBack({ .pos = {10 * 12 / cos(45.0 * kPI / 180.0) * cos(45.0 * kPI / 180.0), 10 * 12 / cos(45.0 * kPI / 180.0) * sin(45.0 * kPI / 180.0)},
                    .bc_x = {.type = BCType::DISPLACEMENT, .value = 0},
                    .bc_y = {.type = BCType::DISPLACEMENT, .value = 0} });
    nodes.PushBack({ .pos = {10 * 12, 0},
                    .bc_x = {.type = BCType::DISPLACEMENT, .value = 0},
                    .bc_y = {.type = BCType::DISPLACEMENT, .value = 0} });
    // Node nodes[kNNodes] = {
    //     {.pos = {0.0, 0.0},
    //      .bc_x = {.type = BCType::FORCE, .value = 0},
    //      .bc_y = {.type = BCType::FORCE, .value = -10'000}},
    //     {.pos = {0.0, 10.0 * 12},
    //      .bc_x = {.type = BCType::DISPLACEMENT, .value = 0},
    //      .bc_y = {.type = BCType::DISPLACEMENT, .value = 0}},
    //     {.pos = {10 * 12 / cos(45.0 * kPI / 180.0) * cos(45.0 * kPI / 180.0), 10 * 12 / cos(45.0 * kPI / 180.0) * sin(45.0 * kPI / 180.0)},
    //      .bc_x = {.type = BCType::DISPLACEMENT, .value = 0},
    //      .bc_y = {.type = BCType::DISPLACEMENT, .value = 0}},
    //     {.pos = {10 * 12, 0},
    //      .bc_x = {.type = BCType::DISPLACEMENT, .value = 0},
    //      .bc_y = {.type = BCType::DISPLACEMENT, .value = 0}},
    // };

    elements.PushBack({ .node_id_i = 0, .node_id_f = 1, .young_modulus = 30e6, .area = 2 });
    elements.PushBack({ .node_id_i = 0, .node_id_f = 2, .young_modulus = 30e6, .area = 2 });
    elements.PushBack({ .node_id_i = 0, .node_id_f = 3, .young_modulus = 30e6, .area = 2 });

    // static constexpr auto kNElements = 3;
    // Element elements[kNElements] = {
    //     {.node_id_i = 0, .node_id_f = 1, .young_modulus = 30e6, .area = 2},
    //     {.node_id_i = 0, .node_id_f = 2, .young_modulus = 30e6, .area = 2},
    //     {.node_id_i = 0, .node_id_f = 3, .young_modulus = 30e6, .area = 2},
    // };

    const auto nDofs = 2 * nodes.Size();

    MatrixD K{ nDofs, nDofs };

    for (std::size_t iEle = 0; iEle < elements.Size(); iEle++)
    {
        const auto& element = elements[iEle];

        auto ke = GetTrussElementStiffnes(nodes, element);

        const auto base_id_i = element.node_id_i * 2;
        const auto base_id_f = element.node_id_f * 2;

        K(base_id_i, base_id_i + 0) += ke(0, 0);
        K(base_id_i, base_id_i + 1) += ke(0, 1);
        K(base_id_i, base_id_f + 0) += ke(0, 2);
        K(base_id_i, base_id_f + 1) += ke(0, 3);

        K(base_id_i + 1, base_id_i + 0) += ke(1, 0);
        K(base_id_i + 1, base_id_i + 1) += ke(1, 1);
        K(base_id_i + 1, base_id_f + 0) += ke(1, 2);
        K(base_id_i + 1, base_id_f + 1) += ke(1, 3);

        K(base_id_f, base_id_i + 0) += ke(2, 0);
        K(base_id_f, base_id_i + 1) += ke(2, 1);
        K(base_id_f, base_id_f + 0) += ke(2, 2);
        K(base_id_f, base_id_f + 1) += ke(2, 3);

        K(base_id_f + 1, base_id_i + 0) += ke(3, 0);
        K(base_id_f + 1, base_id_i + 1) += ke(3, 1);
        K(base_id_f + 1, base_id_f + 0) += ke(3, 2);
        K(base_id_f + 1, base_id_f + 1) += ke(3, 3);
    }

    auto k_sistema = K;
    MatrixD rhs_sistema{ k_sistema.GetNRows(), 1 };

    for (std::size_t i = 0; i < nodes.Size(); i++)
    {
        const auto& node = nodes[i];
        const auto global_row_x = i * 2;
        const auto global_row_y = i * 2 + 1;

        const auto handle_bc = [&rhs_sistema, &k_sistema](BoundaryCondition bc, std::size_t global_row)
            {
                switch (bc.type)
                {
                case BCType::FORCE:
                    rhs_sistema(global_row, 0) = bc.value;
                    break;
                case BCType::DISPLACEMENT:
                    // TODO: Handle non homogeneous displacement
                    rhs_sistema(global_row, 0) = 0;
                    k_sistema(global_row, global_row) = 1e33;
                    break;
                }
            };

        handle_bc(node.bc_x, global_row_x);
        handle_bc(node.bc_y, global_row_y);
    }

    auto displacements = ResSistLinearPALU(k_sistema, rhs_sistema);
    auto forces = K * displacements;

    // show displacements and forces.
}

BCType ToBcType(int type)
{
    switch (type)
    {
    case kBcForce:
        return BCType::FORCE;
    case kBcDisplacement:
        return BCType::DISPLACEMENT;
    }

    return BCType::FORCE;
}

extern "C" int AddNode(double pos_x, double pos_y, int bc_x_type, double bc_x_value, int bc_y_type, double bc_y_value)
{
    const auto is_bc_type_valid = [](int type) -> bool
        {
            return type == kBcDisplacement || type == kBcForce;
        };

    if (!is_bc_type_valid(bc_x_type) || !is_bc_type_valid(bc_x_type))
    {
        return kInvalidId;
    }
    nodes.PushBack({ .pos = {.x = pos_x, .y = pos_y},
                    .bc_x = {.type = ToBcType(bc_x_type), .value = bc_x_value},
                    .bc_y = {.type = ToBcType(bc_y_type), .value = bc_y_value} });

    return nodes.Size() - 1;
}

extern "C" int AddElement(int node_id_i, int node_id_f, double young_mod, double area)
{
    if (node_id_f < 0 || node_id_i < 0 || young_mod <= 0 || area <= 0)
        return kInvalidId;

    elements.PushBack({
        .node_id_i = static_cast<std::size_t>(node_id_i),
        .node_id_f = static_cast<std::size_t>(node_id_f),
        .young_modulus = young_mod,
        .area = area,
        });

    return elements.Size() - 1;
}

bool IsNodeIdValid(int node_id)
{
    return node_id >= 0 && node_id < nodes.Size();
};

extern "C" double GetNodeDisplacementX(int node_id)
{
    if (!IsNodeIdValid(node_id))
    {
        return 3e-33;
    }
    return displacements(node_id * 2, 0);
}

extern "C" double GetNodeDisplacementY(int node_id)
{
    if (!IsNodeIdValid(node_id))
    {
        return 3e-33;
    }
    return displacements(node_id * 2 + 1, 0);
}

extern "C" double GetNodeForceX(int node_id)
{
    if (!IsNodeIdValid(node_id))
    {
        return 3e-33;
    }
    return forces(node_id * 2, 0);
}

extern "C" double GetNodeForceY(int node_id)
{
    if (!IsNodeIdValid(node_id))
    {
        return 3e-33;
    }
    return forces(node_id * 2 + 1, 0);
}

void PrintMatrix(const MatrixD& m, const char* filename)
{
#ifndef WASM
    std::ofstream f(filename);

    // printf("M = [\n]");
    for (size_t i = 0; i < m.GetNRows(); i++)
    {
        // printf("    [");
        for (size_t j = 0; j < m.GetNCols(); j++)
        {
            f << m(i, j) << ',';
            // printf("    %.3e,", m(i, j));
        }
        f << '\n';
        // printf("    ]\n");
    }
    // printf("];\n");
#endif
}

// Solves: Ax=b -> finds x
MatrixD SolveLinearEquationsJacobi(const MatrixD& A, const MatrixD& b, std::size_t max_iterations = 500, double tol = 1e-6)
{
    MatrixD result{ b.GetNRows(), b.GetNCols(), 1.98547 };
    MatrixD oldResult{ b.GetNRows(), b.GetNCols(), 1e308 };
    MatrixD oldDiff{ b.GetNRows(), b.GetNCols(), 1e-308 };

    const auto n = A.GetNRows();

    for (std::size_t n_iterations = 0; n_iterations < max_iterations; n_iterations++)
    {
        for (std::size_t i = 0; i < n; i++)
        {
            double sigm = 0.0;
            for (std::size_t j = 0; j < n; j++)
            {
                if (i != j)
                {
                    sigm += A(i, j) * result(j, 0);
                }
            }

            if (A(i, i) != 0.0)
            {
                result(i, 0) = (b(i, 0) - sigm) / A(i, i);
            }
            else
            {
                result(i, 0) = 0.0;
            }

            const auto diff = oldResult - result;

            bool converged = true;

            for (std::size_t i = 0; i < diff.size(); i++)
            {
                if ((diff[i]) / 1 > tol)
                {
                    converged = false;
                    break;
                }
            }

            if (converged)
            {
                break;
            }

            oldResult = result;
            oldDiff = diff;
        }
    }

    return result;
}

extern "C" void Solve()
{
    const auto nDofs = 2 * nodes.Size();

    MatrixD K{ nDofs, nDofs };

    for (std::size_t iEle = 0; iEle < elements.Size(); iEle++)
    {
        const auto& element = elements[iEle];

        auto ke = GetTrussElementStiffnes(nodes, element);

#ifndef WASM
        PrintMatrix(ke, (std::string{ "ke" } + std::to_string(iEle) + ".csv").c_str());
#endif

        const auto base_id_i = element.node_id_i * 2;
        const auto base_id_f = element.node_id_f * 2;

        K(base_id_i, base_id_i + 0) += ke(0, 0);
        K(base_id_i, base_id_i + 1) += ke(0, 1);
        K(base_id_i, base_id_f + 0) += ke(0, 2);
        K(base_id_i, base_id_f + 1) += ke(0, 3);

        K(base_id_i + 1, base_id_i + 0) += ke(1, 0);
        K(base_id_i + 1, base_id_i + 1) += ke(1, 1);
        K(base_id_i + 1, base_id_f + 0) += ke(1, 2);
        K(base_id_i + 1, base_id_f + 1) += ke(1, 3);

        K(base_id_f, base_id_i + 0) += ke(2, 0);
        K(base_id_f, base_id_i + 1) += ke(2, 1);
        K(base_id_f, base_id_f + 0) += ke(2, 2);
        K(base_id_f, base_id_f + 1) += ke(2, 3);

        K(base_id_f + 1, base_id_i + 0) += ke(3, 0);
        K(base_id_f + 1, base_id_i + 1) += ke(3, 1);
        K(base_id_f + 1, base_id_f + 0) += ke(3, 2);
        K(base_id_f + 1, base_id_f + 1) += ke(3, 3);
    }

    auto k_sistema = K;
    MatrixD rhs_sistema{ k_sistema.GetNRows(), 1 };

    for (std::size_t i = 0; i < nodes.Size(); i++)
    {
        const auto& node = nodes[i];
        const auto global_row_x = i * 2;
        const auto global_row_y = i * 2 + 1;

        const auto handle_bc = [&rhs_sistema, &k_sistema](BoundaryCondition bc, std::size_t global_row)
            {
                switch (bc.type)
                {
                case BCType::FORCE:
                    rhs_sistema(global_row, 0) = bc.value;
                    break;
                case BCType::DISPLACEMENT:
                    rhs_sistema(global_row, 0) = bc.value;
                    for (std::size_t i = 0; i < nodes.Size() * 2; i++)
                    {
                        k_sistema(global_row, i) = i != global_row ? 0 : 1;
                    }
                    break;
                }
            };

        handle_bc(node.bc_x, global_row_x);
        handle_bc(node.bc_y, global_row_y);
    }

    PrintMatrix(k_sistema, "k_sistema.csv");
    PrintMatrix(rhs_sistema, "rhs_sistema.csv");

    // displacements = SolveLinearEquationsJacobi(k_sistema, rhs_sistema, 500, 1e-32);
    displacements = ResSistLinearPALU(k_sistema, rhs_sistema);
    PrintMatrix(displacements, "displacements.csv");
    forces = K * displacements;
    PrintMatrix(forces, "forces.csv");
}