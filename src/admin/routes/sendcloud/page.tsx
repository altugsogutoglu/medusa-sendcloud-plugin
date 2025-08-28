import { defineRouteConfig } from "@medusajs/admin-sdk";
import RocketLaunch from "@medusajs/icons/dist/components/rocket-launch";
import { 
  Container, 
  Heading, 
  Table, 
  StatusBadge, 
  Text,
  Badge,
  Button,
  Toaster 
} from "@medusajs/ui";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface SendCloudShipment {
  id: string;
  order_id: string;
  sendcloud_id: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  status: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_city: string;
  recipient_postal_code: string;
  recipient_country: string;
  error_message: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface SendCloudResponse {
  shipments: SendCloudShipment[];
  count: number;
  offset: number;
  limit: number;
}

const SendCloudShipments = () => {
  console.log("🚀 [UPDATED] SendCloudShipments component loaded from page.tsx");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const pageSize = 20;

  // Build query parameters
  const queryParams = new URLSearchParams({
    limit: pageSize.toString(),
    offset: ((currentPage - 1) * pageSize).toString(),
    ...(statusFilter && { status: statusFilter }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["sendcloud-shipments", currentPage, statusFilter],
    queryFn: async () => {
      const response = await fetch(`/admin/sendcloud?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      return response.json() as Promise<SendCloudResponse>;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "green";
      case "en_route":
      case "sorted":
        return "blue";
      case "exception":
        return "red";
      case "pending":
      case "announced":
        return "orange";
      default:
        return "grey";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center h-64">
        <Text>Loading shipments...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="flex items-center justify-center h-64">
        <Text className="text-red-600">
          Error loading shipments: {error.message}
        </Text>
      </Container>
    );
  }

  const shipments = data?.shipments || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b">
          <div>
            <Heading className="font-sans font-medium h1-core">
              SendCloud Shipm26262ents
            </Heading>
            <Text className="text-ui-fg-subtle">
              Manage and track your SendCloud shipments
            </Text>
          </div>
          <div className="flex gap-2">
            <Badge size="small">
              Total: {totalCount}
            </Badge>
          </div>
        </div>

        {/* Status Filter */}
        <div className="p-6 border-b">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "" ? "primary" : "secondary"}
              size="small"
              onClick={() => setStatusFilter("")}
            >
              All
            </Button>
            {["pending", "en_route", "delivered", "exception"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "primary" : "secondary"}
                size="small"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
              >
                {formatStatus(status)}
              </Button>
            ))}
          </div>
        </div>

        {shipments.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order ID</Table.HeaderCell>
                  <Table.HeaderCell>Customer</Table.HeaderCell>
                  <Table.HeaderCell>Destination</Table.HeaderCell>
                  <Table.HeaderCell>Carrier</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Tracking</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Delivered</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {shipments.map((shipment) => (
                  <Table.Row key={shipment.id}>
                    <Table.Cell>
                      <Link 
                        to={`/app/orders/${shipment.order_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{shipment.order_id.slice(-8)}
                      </Link>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <div>
                        <Text size="small" weight="plus">
                          {shipment.recipient_name}
                        </Text>
                        {shipment.recipient_email && (
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            {shipment.recipient_email}
                          </Text>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div>
                        <Text size="small">
                          {shipment.recipient_city}, {shipment.recipient_postal_code}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {shipment.recipient_country}
                        </Text>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      {shipment.carrier ? (
                        <Badge size="small">
                          {shipment.carrier}
                        </Badge>
                      ) : (
                        <Text className="text-ui-fg-subtle">-</Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <StatusBadge color={getStatusColor(shipment.status)}>
                        {formatStatus(shipment.status)}
                      </StatusBadge>
                      {shipment.error_message && (
                        <Text size="xsmall" className="text-red-600 mt-1">
                          Error: {shipment.error_message}
                        </Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      {shipment.tracking_url ? (
                        <div>
                          <Link 
                            to={shipment.tracking_url} 
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            {shipment.tracking_number || "Track"}
                          </Link>
                        </div>
                      ) : (
                        <Text className="text-ui-fg-subtle">
                          {shipment.tracking_number || "-"}
                        </Text>
                      )}
                    </Table.Cell>

                    <Table.Cell>
                      <Text size="small">
                        {formatDate(shipment.created_at)}
                      </Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Text size="small">
                        {formatDate(shipment.delivered_at)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RocketLaunch className="mx-auto h-12 w-12 text-ui-fg-subtle mb-4" />
              <Heading level="h3" className="mb-2">
                No shipments found
              </Heading>
              <Text className="text-ui-fg-subtle">
                {statusFilter 
                  ? `No shipments with status "${formatStatus(statusFilter)}" found.`
                  : "No SendCloud shipments have been created yet."
                }
              </Text>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t flex justify-between items-center">
            <Text size="small" className="text-ui-fg-subtle">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} shipments
            </Text>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text size="small" className="flex items-center px-3">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Container>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "SendCloud Shipments",
  icon: RocketLaunch,
});

export default SendCloudShipments;
