FROM golang:1.23-alpine AS builder

# Instalar Git Para Dependencias De Fiber
RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o recolector .

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/recolector .

RUN mkdir -p /proc

EXPOSE 6000

CMD ["./recolector"]