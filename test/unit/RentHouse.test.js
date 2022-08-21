const { expect, assert } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RentHouse", function () {
          let rentHouse
          let deployer
          let propertyName = "Shalimar"
          let propertyDescription = "XYZ"
          let checkinDate = 0
          let checkoutDate = 10
          let price = 4500
          let totalPrice = price * (checkoutDate - checkinDate)

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              rentHouse = await ethers.getContract("RentHouse", deployer)
          })

          describe("rentOutProperty", function () {
              it("increments the propertyId", async function () {
                  const propertyId = 1
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  const property_id = await rentHouse.getPropertyId()
                  assert.equal(property_id.toString(), propertyId.toString())
              })

              it("emits the event PropertyBooked", async function () {
                  expect(
                      await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  ).to.emit("PropertyBooked")
              })
          })

          describe("rentProperty", function () {
              const property_id = 1
              it("increments the booking ID", async function () {
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  await rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                      value: totalPrice,
                  })
                  const bookingId = await rentHouse.getBookingId()
                  assert.equal(bookingId.toString(), "1")
              })

              it("reverts back if property is not active", async function () {
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  await rentHouse.makePropertyAsInActive(property_id)
                  await expect(
                      rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                          value: totalPrice,
                      })
                  ).to.be.revertedWith("RentHouse__PropertyNotActive")
              })

              it("reverts back if property is already booked on particular days", async function () {
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  await rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                      value: totalPrice,
                  })
                  await expect(
                      rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                          value: totalPrice,
                      })
                  ).to.be.revertedWith("RentHouse__PropertyNotAvailableForTheSelectedDate")
              })

              it("reverts back if not enough ETH is sent", async function () {
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  await expect(
                      rentHouse.rentProperty(property_id, checkinDate, checkoutDate)
                  ).to.be.revertedWith("RentHouse__NotEnoughETHSent")
              })

              it("emits the event if property is booked successfull", async function () {
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  expect(
                      await rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                          value: totalPrice,
                      })
                  ).to.emit("PropertyRented")
              })

              it("reverts back if someone else tries to make property inactive", async function () {
                  await expect(rentHouse.makePropertyAsInActive(2)).to.be.revertedWith(
                      "RentHouse__NotOwner"
                  )
              })
          })

          describe("withdraw", function () {
              const property_id = 1
              beforeEach(async () => {
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  await rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                      value: totalPrice,
                  })
              })
              it("withdraws the money and transfer it to owner", async function () {
                  // Arrange
                  const startingRentHouseBalance = await rentHouse.provider.getBalance(
                      rentHouse.address
                  )
                  const startingOwnerBalance = await rentHouse.provider.getBalance(deployer)

                  // Act

                  const transactionResponse = await rentHouse.withdraw(property_id, 1)
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingRentHouseBalance = await rentHouse.provider.getBalance(
                      rentHouse.address
                  )
                  const endingOwnerBalance = await rentHouse.provider.getBalance(deployer)

                  assert.equal(endingRentHouseBalance.toString(), "0")
                  assert.equal(
                      startingRentHouseBalance.add(startingOwnerBalance).toString(),
                      endingOwnerBalance.add(gasCost).toString()
                  )
              })
          })

          describe("Getter Functions", function () {
              it("returns property details correctly", async function () {
                  const propertyId = 1
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  const name = await rentHouse.getPropertyName(propertyId)
                  const desc = await rentHouse.getPropertyDescription(propertyId)
                  const owner = await rentHouse.getPropertyOwner(propertyId)
                  const priceOfHouse = await rentHouse.getPropertyPrice(propertyId)
                  assert.equal(name.toString(), propertyName)
                  assert.equal(desc.toString(), propertyDescription)
                  //   assert.equal(owner.toString(), rentHouse.address)
                  assert.equal(priceOfHouse.toString(), price)
              })

              it("returns booking details correctly", async function () {
                  const property_id = 1
                  const bookingId = 1
                  await rentHouse.rentOutProperty(propertyName, propertyDescription, price)
                  await rentHouse.rentProperty(property_id, checkinDate, checkoutDate, {
                      value: totalPrice,
                  })
                  const checkInDate = await rentHouse.getBookingCheckinDate(bookingId)
                  const checkOutDate = await rentHouse.getBookingCheckoutDate(bookingId)
                  assert.equal(checkInDate.toString(), checkinDate)
                  assert.equal(checkOutDate.toString(), checkoutDate)
              })
          })
      })
